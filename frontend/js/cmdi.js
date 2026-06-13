const cmdiForm = document.getElementById("cmdiForm");
const hostInput = document.getElementById("hostInput");
const cmdiMessage = document.getElementById("cmdiMessage");
const cmdiOutput = document.getElementById("cmdiOutput");

async function saveProgress(labKey) {
    try {
        await fetch(`${API_BASE_URL}/api/progress/solve`, {
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

cmdiForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const host = hostInput.value;

    cmdiMessage.style.color = "#38bdf8";
    cmdiMessage.textContent = "Executing ping command...";
    cmdiOutput.textContent = "Running...";

    try {
        const response = await fetch(`${API_BASE_URL}/api/cmdi/ping`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ host })
        });

        const data = await response.json();

        cmdiOutput.textContent =
            data.output ||
            data.error ||
            JSON.stringify(data, null, 2);

        if (response.ok) {

            if (
                data.output &&
                data.output.includes("Root@2026!")
            ) {
                await saveProgress("lab_cmdi");

                cmdiMessage.style.color = "#22c55e";
                cmdiMessage.textContent =
                    "Lab solved. Administrator backup password retrieved.";
            } else {
                cmdiMessage.style.color = "#22c55e";
                cmdiMessage.textContent =
                    "Command executed successfully.";
            }

        } else {
            cmdiMessage.style.color = "#ef4444";
            cmdiMessage.textContent =
                data.message || "Command failed";
        }

    } catch (err) {
        cmdiMessage.style.color = "#ef4444";
        cmdiMessage.textContent = "Unable to connect to server.";
        cmdiOutput.textContent = err.message;
    }
});