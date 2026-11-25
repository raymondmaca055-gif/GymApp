const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const messageEl = document.getElementById("message");


if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        try {
            const response = await fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (data.success) {

                localStorage.setItem("token", data.token);
                localStorage.setItem("role", data.role);
                localStorage.setItem("name", data.name);

                messageEl.style.color = "green";
                messageEl.textContent =
                    "Login successful! Redirecting...";

                if (data.role === "admin") {
                    window.location.href = "/admindashboard.html";

                } else {
                    window.location.href = "/memberdashboard.html";
                }

            } else {
                messageEl.style.color = "red";
                messageEl.textContent =
                    data.message || "Invalid email or password.";
            }

        } catch (error) {
           console.error("FULL ERROR:", error);

            messageEl.style.color = "red";
            messageEl.textContent =
            "Server connection error: " + error.message;
        }
    });
}