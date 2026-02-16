from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from data_generator import LeadScoringDataGenerator
from ml_service import MLService
import pandas as pd

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML Service
ml_service = MLService()

# Train model on startup
@app.on_event("startup")
async def startup_event():
    ml_service.train()

# Generate NEW data for simulation (Acting as 'Live' data)
# We use a separate generator for this to simulate new leads coming in
live_data_generator = LeadScoringDataGenerator(n_records=50)

@app.get("/")
def read_root():
    return {"message": "Lead Scoring API v2 (ML Enabled) is running"}

# ... existing code ...

# Input Validation Model (Simulates a subset of the full schema)
class LeadInput(BaseModel):
    industry: str
    lead_source: str
    company_size_employees: int
    company_size_revenue_usd: float
    technologies_used: str  # Comma-separated string
    crm_current_stage: str
    
    # Optional fields with defaults to simplify manual entry
    job_title: str = "Manager"
    seniority_level: str = "Manager"
    department: str = "Sales"
    company_id: str = "MANUAL_ENTRY"
    contact_id: str = "MANUAL_ENTRY"
    company_location_country: str = "USA"
    company_location_state: str = "CA"
    contact_location_country: str = "USA"
    contact_location_state: str = "CA"
    is_public_company: bool = False
    email_unsubscribed: bool = False
    website_pages_visited_count: int = 5
    website_downloads_count: int = 0
    website_form_submissions_count: int = 0
    email_opens_count: int = 0
    email_clicks_count: int = 0
    crm_sales_calls_count: int = 0
    crm_meetings_scheduled_count: int = 0
    crm_email_exchanges_count: int = 0
    social_media_interactions_count: int = 0
    product_trial_features_used_count: int = 0
    product_trial_frequency_score: float = 0.5
    marketing_campaign_id: str = "None"
    conversion_status: str = "Unknown"  # Dummy value for prediction
    time_to_conversion_days: float = 0.0
    deal_value_usd: float = 0.0

@app.post("/predict")
def predict_lead(lead: LeadInput):
    """Predicts conversion status for a single lead."""
    # Convert Pydantic model to DataFrame
    lead_dict = lead.dict()
    df_new = pd.DataFrame([lead_dict])
    
    # Run prediction
    try:
        results = ml_service.predict(df_new)
        return results[0] # Return the first (and only) result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/leads")
def get_leads(limit: int = 100):
    """Returns a list of leads with ML predictions."""
    # Generate fresh live data
    df = live_data_generator.generate_data()
    
    # Run predictions
    predictions = ml_service.predict(df)
    
    # Combine data with predictions
    leads_with_predictions = []
    records = df.to_dict(orient='records')
    
    for i, record in enumerate(records):
        # Add prediction info to the record
        record.update(predictions[i])
        leads_with_predictions.append(record)
        
    return leads_with_predictions[:limit]

@app.get("/model-stats")
def get_model_stats():
    """Returns the trained model's performance metrics."""
    return {
        "accuracy": ml_service.accuracy,
        "confusion_matrix": ml_service.confusion_matrix,
        "classification_report": ml_service.classification_report
    }

@app.get("/stats")
def get_stats():
    """Returns aggregated statistics for the dashboard (based on trained historical data logic for simplicity, or could use live data)."""
    # For stats, let's just use the conversion rates from the live data batch for now
    df = live_data_generator.generate_data() # Quick hack: regenerate for stats, or we could cache.
    # In a real app we'd query a DB.
    
    total_leads = len(df)
    conversion_rate = (df['conversion_status'] == 'Closed-Won').mean() * 100
    avg_deal_value = df[df['conversion_status'] == 'Closed-Won']['deal_value_usd'].mean()
    
    industry_counts = df['industry'].value_counts().to_dict()
    conversion_by_source = df[df['conversion_status'] == 'Closed-Won']['lead_source'].value_counts().to_dict()

    return {
        "total_leads": total_leads,
        "conversion_rate": round(conversion_rate, 2),
        "avg_deal_value": round(avg_deal_value, 2) if not pd.isna(avg_deal_value) else 0,
        "industry_distribution": industry_counts,
        "conversion_by_source": conversion_by_source
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
