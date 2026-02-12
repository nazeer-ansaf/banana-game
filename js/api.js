// api.js
// Handles communication with Banana API (Interoperability)

export async function fetchPuzzle() {
    try {
        const response = await fetch("https://marcconrad.com/uob/banana/api.php");

        if (!response.ok) {
            throw new Error("Network response was not OK");
        }

        const data = await response.json();
        console.log("API Data:", data);

        return data;

    } catch (error) {
        console.error("Error fetching puzzle:", error);
        return null;
    }
}
