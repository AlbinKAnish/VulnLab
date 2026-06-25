const sqliForm = document.getElementById("sqliForm");

async function saveProgress(labKey) {
    try {
        await fetch(`${API_BASE_URL}/progress/solve`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                labKey: labKey
            })
        });
    } catch (err) {
        console.error("Progress save failed:", err);
    }
}

if (sqliForm) {
    sqliForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("sqliEmail").value;
        const password = document.getElementById("sqliPassword").value;
        const message = document.getElementById("sqliMessage");
        const output = document.getElementById("sqliOutput");

        message.style.color = "#38bdf8";
        message.textContent = "Sending request...";
        output.textContent = "";

        try {
            const response = await fetch(`${API_BASE_URL}/sqli/login`, {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            output.textContent = JSON.stringify(data, null, 2);

            if (response.ok) {
                await saveProgress("lab_sqli");

                message.style.color = "#22c55e";
                message.textContent = "Login bypass successful!";

            } else {
                message.style.color = "#ef4444";
                message.textContent = data.message || "Login failed";
            }

        } catch (error) {
            message.style.color = "#ef4444";
            message.textContent = "Unable to connect to server";
            output.textContent = error.message;
        }
    });
}