function getRecommendations() {
    const userId = document.getElementById("userId").value;
    const resultsDiv = document.getElementById("results");

    resultsDiv.innerHTML = "Loading...";

    fetch(`http://127.0.0.1:5000/recommend/${userId}`)
        .then(response => response.json())
        .then(data => {
            resultsDiv.innerHTML = "";

            if (data.error) {
                resultsDiv.innerHTML = data.error;
                return;
            }

            data.recommendations.forEach(rec => {
                const div = document.createElement("div");
                div.className = "book";
                div.innerHTML = `
                    <strong>Book ID:</strong> ${rec.book_id}<br>
                    <strong>Predicted Rating:</strong> ${rec.predicted_rating}
                `;
                resultsDiv.appendChild(div);
            });
        })
        .catch(error => {
            resultsDiv.innerHTML = "Error fetching recommendations";
        });
}
