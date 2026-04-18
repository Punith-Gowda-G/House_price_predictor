import requests
import json

try:
    print("Testing /analytics_data...")
    res = requests.get("http://127.0.0.1:8080/analytics_data")
    print(f"Status Code: {res.status_code}")
    if res.status_code == 200:
        data = res.json()
        print("Success! Data keys:")
        print(data.keys())
        print("\nMarket Summary:")
        print(json.dumps(data.get('marketSummary'), indent=2))
    else:
        print(f"Error: {res.text}")
except Exception as e:
    print(f"Failed: {e}")
