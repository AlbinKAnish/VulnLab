const ssrfForm = document.getElementById("ssrfForm");
const urlInput = document.getElementById("urlInput");
const ssrfMessage = document.getElementById("ssrfMessage");
const ssrfOutput = document.getElementById("ssrfOutput");

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

ssrfForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const url = urlInput.value;

    ssrfMessage.style.color = "#38bdf8";
    ssrfMessage.textContent = "Server is fetching the URL...";
    ssrfOutput.textContent = "Loading...";

    try {
        const response = await fetch(`${API_BASE_URL}/ssrf/fetch`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url })
        });

        const data = await response.json();

        ssrfOutput.textContent = JSON.stringify(data, null, 2);

        if (response.ok) {

            if (
                data.data &&
                JSON.stringify(data.data).includes("vulnlab_admin_2026")
            ) {
                await saveProgress("lab_ssrf");

                ssrfMessage.style.color = "#22c55e";
                ssrfMessage.textContent =
                    "Lab solved. Internal API key retrieved.";
            } else {
                ssrfMessage.style.color = "#22c55e";
                ssrfMessage.textContent =
                    "URL fetched successfully.";
            }

        } else {
            ssrfMessage.style.color = "#ef4444";
            ssrfMessage.textContent =
                data.message || "Fetch failed.";
        }

    } catch (err) {
        ssrfMessage.style.color = "#ef4444";
        ssrfMessage.textContent = "Unable to connect to server.";
        ssrfOutput.textContent = err.message;
    }
});