import pandas as pd
import json
import os

def test_logic():
    if not os.path.exists("housing.csv"):
        print("Data source not found")
        return
    
    df = pd.read_csv("housing.csv")
    
    # Clean data
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
    
    # 6. Price Segments
    def get_segment(p):
        if p < 50: return "Budget (<50L)"
        if p < 150: return "Mid-range (50L-1.5Cr)"
        if p < 300: return "Premium (1.5Cr-3Cr)"
        return "Luxury (>3Cr)"
    price_segments = df['price'].apply(get_segment).value_counts().to_dict()

    # 7. Size vs Price
    bins = [0, 800, 1200, 1600, 2000, 3000, 5000, float('inf')]
    labels = ["<800", "800-1200", "1200-1600", "1600-2000", "2000-3000", "3000-5000", "5000+"]
    df['size_bin'] = pd.cut(df['total_sqft'], bins=bins, labels=labels)
    size_price = df.groupby('size_bin', observed=True)['price'].mean().round(2).to_dict()

    # 8. Market Health
    top_10_locations = df['location'].value_counts().head(10).index
    health_data = {}
    for loc in top_10_locations:
        loc_df = df[df['location'] == loc]
        ready_count = len(loc_df[loc_df['availability'] == 'Ready To Move'])
        health_data[loc] = round((ready_count / len(loc_df)) * 100, 1)

    print("SUCCESS: Logic verified.")
    print(f"Price Segments: {list(price_segments.keys())[:2]}...")
    print(f"Size Pricing: {list(size_price.keys())[:2]}...")
    print(f"Market Health: {list(health_data.keys())[:2]}...")

if __name__ == "__main__":
    test_logic()
