const API_BASE = "http://127.0.0.1:5000";
const userInput = document.getElementById("userId");
const resultsDiv = document.getElementById("results");

let maxUsers = 0;

// Fetch total user count for placeholder & validation
fetch(`${API_BASE}/users/count`)
    .then(res => res.json())
    .then(data => {
        maxUsers = data.count;
        userInput.placeholder = `Enter user ID between 1 and ${maxUsers}`;
        userInput.max = maxUsers;
    })
    .catch(() => {
        userInput.placeholder = "Enter user ID (starting from 1)";
    });

function getRecommendations() {
    const userId = parseInt(userInput.value);

    if (!userId || userId < 1 || (maxUsers && userId > maxUsers)) {
        alert(`Please enter a valid user ID between 1 and ${maxUsers}`);
        return;
    }

    resultsDiv.innerHTML = "Fetching recommendations...";

    fetch(`${API_BASE}/recommend/${userId}`)
        .then(res => res.json())
        .then(data => {
            resultsDiv.innerHTML = "";

            if (data.error) {
                resultsDiv.innerHTML = data.error;
                return;
            }

            data.recommendations.forEach((rec, idx) => {
                const div = document.createElement("div");
                div.className = "book";
                div.innerHTML = `
                    <div><strong>#${idx + 1} Book ID:</strong> ${rec.book_id}</div>
                    <div class="rating">Predicted Rating: ${rec.predicted_rating}</div>
                `;
                resultsDiv.appendChild(div);
            });
        })
        .catch(() => {
            resultsDiv.innerHTML = "Error fetching recommendations";
        });
}

function randomUser() {
    if (!maxUsers) {
        alert("User count not loaded yet");
        return;
    }
    const randomId = Math.floor(Math.random() * maxUsers) + 1;
    userInput.value = randomId;
    getRecommendations();
}
