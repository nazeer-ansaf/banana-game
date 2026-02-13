// api.js – Handles communication with Banana API & local fallback

const API_URL = "https://marcconrad.com/uob/banana/api.php";

// Example local fallback puzzles
const localPuzzles = [
    { question: "assets/images/puzzle1.png", solution: 7 },
    { question: "assets/images/puzzle2.png", solution: 12 },
    { question: "assets/images/puzzle3.png", solution: 5 },
];

// -------------------------
// Fetch puzzle from API or fallback
// -------------------------
export async function fetchPuzzle() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Network response was not OK");
        }

        const data = await response.json();
        console.log("API Data:", data);

        // Ensure data has question & solution
        if (data.question && data.solution !== undefined) {
            return data;
        } else {
            throw new Error("Invalid API data");
        }

    } catch (error) {
        console.warn("Error fetching API puzzle, using local fallback:", error);

        // Pick a random puzzle from localPuzzles
        const randomIndex = Math.floor(Math.random() * localPuzzles.length);
        return localPuzzles[randomIndex];
    }
}
