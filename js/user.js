export async function authUser(username, password, action) {

    const response = await fetch("http://localhost/banana-game/login.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            username,
            password,
            action
        })
    });

    const data = await response.json();

    if (data.status === "success") {
        localStorage.setItem("bananaGameUser", username);
        return true;
    } else {
        alert(data.message);
        return false;
    }
}
