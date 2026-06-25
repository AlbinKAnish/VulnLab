const downloadForm = document.getElementById("downloadForm");

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

downloadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const filename = document.getElementById("filename").value;
    const message = document.getElementById("downloadMessage");
    const output = document.getElementById("downloadOutput");

    message.style.color = "#38bdf8";
    message.textContent = "Requesting file...";
    output.textContent = "";

    try {
        const response = await fetch(
            `${API_BASE_URL}/files/download?file=${filename}`
        );

        const data = await response.text();

        output.textContent = data;

        if (response.ok) {

            if (
                filename.includes("../backups/admin-notes.txt")
            ) {
                await saveProgress("lab_path");
            }

            message.style.color = "#22c55e";
            message.textContent = "File retrieved successfully.";

        } else {

            message.style.color = "#ef4444";
            message.textContent = "File not found or access failed.";
        }

    } catch (err) {

        message.style.color = "#ef4444";
        message.textContent = "Unable to connect to server.";
        output.textContent = err.message;
    }
});