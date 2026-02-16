import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
from data_generator import LeadScoringDataGenerator

class MLService:
    def __init__(self):
        self.model = None
        self.unique_technologies = []
        self.categorical_cols_encoded = []
        self.X_columns = [] # Store columns after training to ensure alignment
        self.accuracy = 0.0
        self.confusion_matrix = None
        self.classification_report = None

    def _prepare_data(self, df, is_training=True):
        # 1. Handle Missing Values (Impute with 0)
        if 'time_to_conversion_days' in df.columns:
            df['time_to_conversion_days'] = df['time_to_conversion_days'].fillna(0)
        if 'deal_value_usd' in df.columns:
            df['deal_value_usd'] = df['deal_value_usd'].fillna(0)

        # 2. Process Technologies Used
        if is_training:
            all_technologies = set()
            for tech_string in df['technologies_used']:
                if tech_string:
                    technologies = [tech.strip() for tech in tech_string.split(',')]
                    all_technologies.update(technologies)
            self.unique_technologies = sorted(list(all_technologies))
        
        for tech in self.unique_technologies:
            df[f'tech_{tech.lower().replace(" ", "_")}'] = df['technologies_used'].apply(lambda x: 1 if tech in x else 0)
        
        df = df.drop('technologies_used', axis=1)

        # 3. One-Hot Encoding
        # Identify categorical columns (excluding identifiers and target)
        if is_training:
            self.categorical_cols_encoded = [col for col in df.columns if (df[col].dtype == 'category' or df[col].dtype == 'string' or df[col].dtype == 'object') 
                                             and col not in ['company_id', 'contact_id', 'conversion_status']]
        
        # We need to use pd.get_dummies, but align with training columns if predicting
        df_encoded = pd.get_dummies(df, columns=self.categorical_cols_encoded, drop_first=True)
        
        # 4. Drop Identifiers and Target (if present) to create X
        cols_to_drop = ['company_id', 'contact_id']
        if 'conversion_status' in df_encoded.columns:
             cols_to_drop.append('conversion_status')
             
        X = df_encoded.drop(columns=[c for c in cols_to_drop if c in df_encoded.columns])
        
        if is_training:
            self.X_columns = X.columns.tolist()
        else:
            # Reindex to match training columns
            X = X.reindex(columns=self.X_columns, fill_value=0)
            
        return X

    def train(self):
        print("Starts training...")
        # Generate training data
        generator = LeadScoringDataGenerator(n_records=1000)
        df = generator.generate_data()
        
        # Prepare Features (X) and Target (y)
        y = df['conversion_status']
        X = self._prepare_data(df, is_training=True)
        
        # Split Data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        
        # Train Model
        self.model = LogisticRegression(random_state=42, max_iter=2000)
        self.model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test)
        self.accuracy = accuracy_score(y_test, y_pred)
        self.confusion_matrix = confusion_matrix(y_test, y_pred).tolist() # Convert to list for JSON serialization
        self.classification_report = classification_report(y_test, y_pred, output_dict=True)
        
        print(f"Model trained with accuracy: {self.accuracy:.4f}")
        return self.accuracy

    def predict(self, df):
        if self.model is None:
            raise Exception("Model not trained yet.")
        
        # Prepare data for prediction
        X_new = self._prepare_data(df.copy(), is_training=False)
        
        predictions = self.model.predict(X_new)
        probabilities = self.model.predict_proba(X_new)
        
        # Format results
        results = []
        for i, pred in enumerate(predictions):
            # Get max probability (confidence)
            confidence = np.max(probabilities[i])
            results.append({
                "predicted_status": pred,
                "confidence_score": float(confidence),
                "probabilities": {class_label: float(prob) for class_label, prob in zip(self.model.classes_, probabilities[i])}
            })
            
        return results
