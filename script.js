const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const messageEl = document.getElementById("message");

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (email === "test@gmail.com" && password === "password123") {
            messageEl.style.color = "green";
            messageEl.textContent = "Login successful! Redirecting...";
            window.location.href = "dashboard.html";
        } else {
            messageEl.style.color = "red";
            messageEl.textContent = "Invalid email or password.";
        }
    });
}