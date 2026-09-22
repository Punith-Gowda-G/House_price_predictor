import pandas as pd
from sklearn.linear_model import LinearRegression
import pickle
import json

# Load dataset
data = pd.read_csv("housing.csv")

# Data cleaning
data = data.drop(['area_type', 'availability', 'society'], axis=1) # Drop irrelevant columns
data = data.dropna()

# Convert size (e.g. "2 BHK") → bedrooms
data["bedrooms"] = data["size"].str.extract("(\d+)").astype(float)

# Convert total_sqft to numeric, handling ranges (e.g. "1100 - 1200")
def convert_sqft_to_num(x):
    tokens = str(x).split("-")
    if len(tokens) == 2:
        return (float(tokens[0]) + float(tokens[1])) / 2
    try:
        return float(x)
    except:
        return None

data["total_sqft"] = data["total_sqft"].apply(convert_sqft_to_num)
data = data.dropna()

# Location dimensionality reduction
data['location'] = data['location'].apply(lambda x: x.strip())
location_stats = data.groupby('location')['location'].agg('count').sort_values(ascending=False)
location_less_than_10 = location_stats[location_stats <= 10]
data['location'] = data['location'].apply(lambda x: 'other' if x in location_less_than_10 else x)

# One-hot encoding for location
dummies = pd.get_dummies(data.location)
data = pd.concat([data, dummies.drop('other', axis='columns')], axis='columns')
data = data.drop('location', axis='columns')

# Features and target
# We use total_sqft, bedrooms, bath, balcony and the location dummies
X = data.drop(['price', 'size'], axis='columns')
y = data["price"]

# Train model
model = LinearRegression()
model.fit(X, y)

# Save model and columns
pickle.dump(model, open("model.pkl", "wb"))

# Save column names to a JSON file for the backend to use
with open("columns.json", "w") as f:
    f.write(json.dumps({"data_columns": [col.lower() for col in X.columns]}))

print("Model trained successfully with location features!")