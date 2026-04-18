import pandas as pd
import os
import json

def test_logic():
    try:
        if not os.path.exists("housing.csv"):
            print("Error: housing.csv missing")
            return
        
        df = pd.read_csv("housing.csv")
        print(f"Loaded {len(df)} rows")
        
        # Clean data for analytics
        df['size'] = df['size'].fillna('2 BHK')
        df['bhk'] = df['size'].str.extract('(\d+)').astype(float).fillna(2)
        
        def clean_sqft(x):
            try:
                tokens = str(x).split("-")
                if len(tokens) == 2: return (float(tokens[0]) + float(tokens[1])) / 2
                return float(x)
            except: return None
        
        df['total_sqft'] = df['total_sqft'].apply(clean_sqft)
        df = df.dropna(subset=['total_sqft', 'price'])
        
        # 1. Price vs BHK
        bhk_price = df.groupby('bhk')['price'].mean().round(2).to_dict()
        print("Price vs BHK calculated")
        
        # 2. Top 10 Locations by Avg Price
        top_locs = df.groupby('location')['price'].mean().sort_values(ascending=False).head(10).round(2).to_dict()
        print("Top locations calculated")
        
        # 3. Area Type Distribution
        area_dist = df['area_type'].value_counts().to_dict()
        print("Area distribution calculated")
        
        # 4. Availability Breakdown
        avail_dist = df['availability'].apply(lambda x: "Ready to Move" if x == "Ready To Move" else "Upcoming").value_counts().to_dict()
        print("Availability calculated")
        
        # 5. Average Price per Sqft by Location (Top 10)
        df['pps'] = (df['price'] * 100000) / df['total_sqft']
        top_pps = df.groupby('location')['pps'].mean().sort_values(ascending=False).head(10).round(0).to_dict()
        print("Price per Sqft calculated")

        res = {
            "bhkPrice": bhk_price,
            "topLocations": top_locs,
            "areaDist": area_dist,
            "availDist": avail_dist,
            "topPPS": top_pps,
            "marketSummary": {
                "avgPrice": round(df['price'].mean(), 2),
                "totalListings": len(df),
                "avgPPS": round(df['pps'].mean(), 0)
            }
        }
        print("\nFinal Data structure keys:", res.keys())
        print("Market Summary:", res['marketSummary'])
        
    except Exception as e:
        print(f"Error in logic: {e}")

if __name__ == "__main__":
    test_logic()
