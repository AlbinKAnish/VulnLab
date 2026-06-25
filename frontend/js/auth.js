// =====================
// User Registration
// =====================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const message = document.getElementById("message");

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                message.style.color = "#22c55e";
                message.textContent = "Registration successful! Redirecting to login...";

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1500);
            } else {
                message.style.color = "#ef4444";
                message.textContent = data.message || "Registration failed";
            }
        } catch (error) {
            message.style.color = "#ef4444";
            message.textContent = "Unable to connect to server";
        }
    });
}


// =====================
// User Login
// =====================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;
        const message = document.getElementById("loginMessage");

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
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

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                message.style.color = "#22c55e";
                message.textContent = "Login successful! Redirecting to Dashboard...";

                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1200);
            } else {
                message.style.color = "#ef4444";
                message.textContent = data.message || "Login failed";
            }
        } catch (error) {
            message.style.color = "#ef4444";
            message.textContent = "Unable to connect to server";
        }
    });
}


// =====================
// Admin Login
// =====================

const adminLoginForm = document.getElementById("adminLoginForm");

if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("adminEmail").value;
        const password = document.getElementById("adminPassword").value;
        const message = document.getElementById("adminLoginMessage");

        try {
            const response = await fetch(`${API_BASE_URL}/auth/admin-login`, {
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

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                message.style.color = "#22c55e";
                message.textContent = "Admin login successful! Redirecting...";

                setTimeout(() => {
                    window.location.href = "admin.html";
                }, 1200);
            } else {
                message.style.color = "#ef4444";
                message.textContent = data.message || "Admin login failed";
            }
        } catch (error) {
            message.style.color = "#ef4444";
            message.textContent = "Unable to connect to server";
        }
    });
}