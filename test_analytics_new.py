import requests
import json

try:
    response = requests.get("http://localhost:8080/analytics_data")
    if response.status_code == 200:
        data = response.json()
        print("Analytics Keys Found:")
        for key in data.keys():
            print(f"- {key}")
        
        print("Raw Data:")
        print(json.dumps(data, indent=2))
    else:
        print(f"Failed to connect. Status code: {response.status_code}")
except Exception as e:
    print(f"Error: {e}")
