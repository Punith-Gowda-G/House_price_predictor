import requests
import json

def test_predict(location, area=1000, bedrooms=2, bathrooms=2, balcony=1):
    url = "http://127.0.0.1:8080/predict"
    payload = {
        "location": location,
        "area": area,
        "bedrooms": bedrooms,
        "bathrooms": bathrooms,
        "balcony": balcony,
        "currency": "INR"
    }
    try:
        response = requests.post(url, json=payload)
        return response.json()
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    print("Testing predictions with different locations...")
    
    # These locations should exist in the model if they had > 10 entries
    locs = ["Whitefield", "Indira Nagar", "Rajaji Nagar", "Electronic City", "OtherPlaceThatDoesNotExist"]
    
    for loc in locs:
        res = test_predict(loc)
        price = res.get('estimatedPrice', 'N/A')
        print(f"Location: {loc:25} -> Estimated Price: {price}")
