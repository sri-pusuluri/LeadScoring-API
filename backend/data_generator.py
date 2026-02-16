import pandas as pd
import numpy as np
import random

class LeadScoringDataGenerator:
    def __init__(self, n_records=1000):
        self.n_records = n_records
        self.schema = {
            # Lead Demographics & Firmographics (B2B)
            'company_id': 'string',
            'industry': 'category',
            'company_size_employees': 'int',
            'company_size_revenue_usd': 'float',
            'company_location_country': 'string',
            'company_location_state': 'string',
            'is_public_company': 'bool',
            'technologies_used': 'string',

            # Contact Information
            'contact_id': 'string',
            'job_title': 'string',
            'seniority_level': 'category',
            'department': 'category',
            'contact_location_country': 'string',
            'contact_location_state': 'string',

            # Behavioral Data (Engagement Data)
            'website_pages_visited_count': 'int',
            'website_time_on_site_seconds': 'float',
            'website_downloads_count': 'int',
            'website_form_submissions_count': 'int',
            'email_opens_count': 'int',
            'email_clicks_count': 'int',
            'email_unsubscribed': 'bool',
            'crm_sales_calls_count': 'int',
            'crm_meetings_scheduled_count': 'int',
            'crm_email_exchanges_count': 'int',
            'crm_current_stage': 'category',
            'social_media_interactions_count': 'int',
            'product_trial_features_used_count': 'int',
            'product_trial_frequency_score': 'float',

            # Source Data
            'lead_source': 'category',
            'marketing_campaign_id': 'string',

            # Conversion Outcome Data (Target Variable)
            'conversion_status': 'category',
            'time_to_conversion_days': 'float',
            'deal_value_usd': 'float'
        }

    def generate_data(self):
        synthetic_data = {}
        
        # IDs
        synthetic_data['company_id'] = [f'COMP_{i}' for i in range(self.n_records)]
        synthetic_data['contact_id'] = [f'CONT_{i}' for i in range(self.n_records)]

        # Categorical Data
        industries = ['SaaS', 'Healthcare', 'Manufacturing', 'Retail', 'Finance', 'Education', 'Technology', 'Marketing']
        job_titles = ['Software Engineer', 'Marketing Manager', 'Sales Representative', 'CEO', 'CTO', 'CFO', 'Data Scientist', 'Product Manager', 'HR Manager']
        seniority_levels = ['Entry', 'Associate', 'Manager', 'Director', 'VP', 'C-level']
        departments = ['Marketing', 'Sales', 'IT', 'Engineering', 'Human Resources', 'Finance', 'Operations']
        crm_stages = ['New Lead', 'Qualified', 'Discovery', 'Proposal', 'Negotiation', 'Closed-Won', 'Closed-Lost']
        lead_sources = ['Organic Search', 'Paid Ad', 'Referral', 'Webinar', 'Social Media', 'Email Campaign', 'Direct Mail']
        countries = ['USA', 'Canada', 'UK', 'Germany', 'Australia']
        states_usa = ['CA', 'NY', 'TX', 'FL', 'IL', 'WA', 'MA', 'GA', 'PA', 'OH']

        synthetic_data['industry'] = np.random.choice(industries, self.n_records)
        synthetic_data['job_title'] = np.random.choice(job_titles, self.n_records)
        synthetic_data['seniority_level'] = np.random.choice(seniority_levels, self.n_records)
        synthetic_data['department'] = np.random.choice(departments, self.n_records)
        synthetic_data['crm_current_stage'] = np.random.choice(crm_stages, self.n_records)
        synthetic_data['lead_source'] = np.random.choice(lead_sources, self.n_records)
        synthetic_data['company_location_country'] = np.random.choice(countries, self.n_records)
        synthetic_data['contact_location_country'] = np.random.choice(countries, self.n_records)
        synthetic_data['company_location_state'] = np.random.choice(states_usa, self.n_records)
        synthetic_data['contact_location_state'] = np.random.choice(states_usa, self.n_records)

        # Boolean Data
        synthetic_data['is_public_company'] = np.random.choice([True, False], self.n_records, p=[0.2, 0.8])
        synthetic_data['email_unsubscribed'] = np.random.choice([True, False], self.n_records, p=[0.1, 0.9])

        # Integer Data
        synthetic_data['company_size_employees'] = np.random.randint(10, 5000, self.n_records)
        synthetic_data['website_pages_visited_count'] = np.random.randint(0, 100, self.n_records)
        synthetic_data['website_downloads_count'] = np.random.randint(0, 10, self.n_records)
        synthetic_data['website_form_submissions_count'] = np.random.randint(0, 5, self.n_records)
        synthetic_data['email_opens_count'] = np.random.randint(0, 20, self.n_records)
        synthetic_data['email_clicks_count'] = np.random.randint(0, 10, self.n_records)
        synthetic_data['crm_sales_calls_count'] = np.random.randint(0, 15, self.n_records)
        synthetic_data['crm_meetings_scheduled_count'] = np.random.randint(0, 5, self.n_records)
        synthetic_data['crm_email_exchanges_count'] = np.random.randint(0, 30, self.n_records)
        synthetic_data['social_media_interactions_count'] = np.random.randint(0, 50, self.n_records)
        synthetic_data['product_trial_features_used_count'] = np.random.randint(0, 10, self.n_records)

        # Float Data
        synthetic_data['company_size_revenue_usd'] = np.random.uniform(100000, 50000000, self.n_records)
        synthetic_data['website_time_on_site_seconds'] = np.random.uniform(10, 1200, self.n_records)
        synthetic_data['product_trial_frequency_score'] = np.random.uniform(0.0, 1.0, self.n_records)

        # Technologies Used
        available_technologies = ['AWS', 'Azure', 'Google Cloud', 'Salesforce', 'SAP', 'Oracle', 'Microsoft Dynamics', 'HubSpot', 'Tableau', 'Power BI', 'Python', 'Java', 'React', 'Angular']
        synthetic_data['technologies_used'] = []
        for _ in range(self.n_records):
            num_technologies = np.random.randint(0, 4)
            selected_techs = np.random.choice(available_technologies, num_technologies, replace=False)
            synthetic_data['technologies_used'].append(', '.join(selected_techs))

        # Marketing Campaign
        marketing_campaign_ids = ['CAMP_2023_Q1', 'CAMP_2023_Q2', 'CAMP_2023_Q3', 'CAMP_2023_Q4', 'CAMP_LAUNCH_PROD_A', 'CAMP_SUMMER_SALE']
        synthetic_data['marketing_campaign_id'] = np.random.choice(marketing_campaign_ids, self.n_records)

        # Conversion Status
        conversion_statuses = ['Closed-Won', 'Closed-Lost', 'Disqualified']
        probabilities = [0.20, 0.50, 0.30]
        synthetic_data['conversion_status'] = np.random.choice(conversion_statuses, self.n_records, p=probabilities)

        # Target Variables (Conditional)
        synthetic_data['time_to_conversion_days'] = np.full(self.n_records, np.nan)
        synthetic_data['deal_value_usd'] = np.full(self.n_records, np.nan)

        closed_won_indices = np.where(synthetic_data['conversion_status'] == 'Closed-Won')[0]
        synthetic_data['time_to_conversion_days'][closed_won_indices] = np.random.randint(10, 180, len(closed_won_indices))
        synthetic_data['deal_value_usd'][closed_won_indices] = np.random.uniform(1000, 100000, len(closed_won_indices))

        # Create DataFrame
        df = pd.DataFrame(synthetic_data)
        
        # Determine cols to cast
        cols_to_cast = {k: v for k, v in self.schema.items() if k in df.columns}
        df = df.astype(cols_to_cast)

        # Handle Missing Values (Impute with 0 as per notebook)
        df['time_to_conversion_days'] = df['time_to_conversion_days'].fillna(0)
        df['deal_value_usd'] = df['deal_value_usd'].fillna(0)

        return df

    def get_data_as_dict(self):
        df = self.generate_data()
        # Convert to dictionary oriented by records
        data = df.to_dict(orient='records')
        # Handle numpy types for JSON serialization if necessary, but fastest way is usually through records
        # However, fastapi might struggle with numpy int/float types. Let's ensure standard python types.
        # Recursively converting DataFrame to JSON string then back to dict is a robust way to handle types.
        import json
        return json.loads(df.to_json(orient='records'))

if __name__ == "__main__":
    generator = LeadScoringDataGenerator(n_records=5)
    print(generator.get_data_as_dict())
