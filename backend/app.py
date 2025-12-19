from flask import Flask, jsonify
from flask_cors import CORS
import pickle
import numpy as np

app = Flask(__name__)
CORS(app)


# Load model artifacts
with open("../models/user_item_matrix.pkl", "rb") as f:
    user_item_matrix = pickle.load(f)

with open("../models/item_similarity.pkl", "rb") as f:
    item_similarity_df = pickle.load(f)
    
def predict_rating(user_id, book_id, k=10):
    if user_id not in user_item_matrix.index or book_id not in user_item_matrix.columns:
        return None

    user_ratings = user_item_matrix.loc[user_id]
    rated_books = user_ratings[user_ratings > 0]

    if rated_books.empty:
        return None

    similarities = item_similarity_df[book_id]
    similarities = similarities[rated_books.index]

    top_k = similarities.sort_values(ascending=False).head(k)

    numerator = np.dot(top_k.values, rated_books[top_k.index].values)
    denominator = np.sum(np.abs(top_k.values))

    if denominator == 0:
        return None

    return float(numerator / denominator)

@app.route("/recommend/<user_id>")
def recommend(user_id):
    if user_id not in user_item_matrix.index:
        return jsonify({"error": "User not found in model"}), 404

    user_ratings = user_item_matrix.loc[user_id]
    unrated_books = user_ratings[user_ratings == 0].index

    predictions = []

    for book_id in unrated_books:
        pred = predict_rating(user_id, book_id)
        if pred is not None:
            predictions.append({
                "book_id": int(book_id),
                "predicted_rating": round(pred, 2)
            })

    predictions = sorted(
        predictions,
        key=lambda x: x["predicted_rating"],
        reverse=True
    )[:10]

    return jsonify({
        "user_id": user_id,
        "recommendations": predictions
    })

if __name__ == "__main__":
    app.run(debug=True)

