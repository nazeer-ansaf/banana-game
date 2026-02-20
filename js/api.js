// API functions

const API_URL = "https://marcconrad.com/uob/banana/api.php";

const localPuzzles = [
    { question: "https://via.placeholder.com/500x300?text=2+%2B+2", solution: 4 },
    { question: "https://via.placeholder.com/500x300?text=5+%2B+3", solution: 8 },
    { question: "https://via.placeholder.com/500x300?text=10+-+4", solution: 6 },
    { question: "https://via.placeholder.com/500x300?text=7+*+2", solution: 14 },
    { question: "https://via.placeholder.com/500x300?text=9+%2F+3", solution: 3 },
    { question: "https://via.placeholder.com/500x300?text=12+-+5", solution: 7 },
    { question: "https://via.placeholder.com/500x300?text=8+*+3", solution: 24 },
    { question: "https://via.placeholder.com/500x300?text=15+%2F+5", solution: 3 }
];

export async function fetchPuzzle() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Network response was not OK");
        }

        const data = await response.json();
        
        if (data.question && data.solution !== undefined) {
            return data;
        } else {
            throw new Error("Invalid API data");
        }

    } catch (error) {
        console.warn("Using local puzzle:", error);
        const randomIndex = Math.floor(Math.random() * localPuzzles.length);
        return localPuzzles[randomIndex];
    }
}