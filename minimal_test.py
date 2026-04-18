from flask import Flask, jsonify
from waitress import serve

app = Flask(__name__)

@app.route("/test")
def test():
    return jsonify({"message": "Hello World"})

if __name__ == "__main__":
    print("Serving on port 8081")
    serve(app, host='0.0.0.0', port=8081)
