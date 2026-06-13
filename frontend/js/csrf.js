const contactForm = document.getElementById("contactForm");
const contactInput = document.getElementById("contactInput");

const profileOutput = document.getElementById("profileOutput");
const normalMessage = document.getElementById("normalMessage");

const csrfPayload = document.getElementById("csrfPayload");
const runAttack = document.getElementById("runAttack");
const csrfMessage = document.getElementById("csrfMessage");

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

async function loadProfile() {

    try {

        const response =
        await fetch(`${API_BASE_URL}/api/csrf/profile`);

        const data =
        await response.json();

        profileOutput.textContent =
        JSON.stringify(data, null, 2);

    }

    catch (err) {

        profileOutput.textContent =
        "Unable to load profile";

    }

}

contactForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    normalMessage.style.color =
    "#38bdf8";

    normalMessage.textContent =
    "Sending normal update request...";

    try {

        const response =
        await fetch(`${API_BASE_URL}/api/csrf/update-contact`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                emergencyContact: contactInput.value
            })
        });

        const data =
        await response.json();

        profileOutput.textContent =
        JSON.stringify(data, null, 2);

        if (response.ok) {

            normalMessage.style.color =
            "#22c55e";

            normalMessage.textContent =
            "Contact updated. Now inspect the request in DevTools → Network.";

        }

        else {

            normalMessage.style.color =
            "#ef4444";

            normalMessage.textContent =
            data.message || "Update failed";

        }

    }

    catch (err) {

        normalMessage.style.color =
        "#ef4444";

        normalMessage.textContent =
        "Unable to connect";

    }

});

runAttack.addEventListener("click", async () => {

    const payload =
    csrfPayload.value.trim();

    if (!payload) {

        csrfMessage.style.color =
        "#ef4444";

        csrfMessage.textContent =
        "Write a CSRF payload first.";

        return;

    }

    if (
        !payload.includes("form") ||
        !payload.includes("update-contact") ||
        !payload.includes("9999999999")
    ) {

        csrfMessage.style.color =
        "#ef4444";

        csrfMessage.textContent =
        "Payload incomplete. It should submit the update-contact request with 9999999999.";

        return;

    }

    csrfMessage.style.color =
    "#38bdf8";

    csrfMessage.textContent =
    "Executing forged request...";

    try {

        const response =
        await fetch(`${API_BASE_URL}/api/csrf/update-contact`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                emergencyContact: "9999999999"
            })
        });

        const data =
        await response.json();

        profileOutput.textContent =
        JSON.stringify(data, null, 2);

        if (response.ok) {

            await saveProgress(
                "lab_csrf"
            );

            csrfMessage.style.color =
            "#22c55e";

            csrfMessage.textContent =
            "CSRF attack successful. Emergency contact changed.";

        }

        else {

            csrfMessage.style.color =
            "#ef4444";

            csrfMessage.textContent =
            data.message || "Attack failed";

        }

    }

    catch (err) {

        csrfMessage.style.color =
        "#ef4444";

        csrfMessage.textContent =
        "Unable to execute attack.";

    }

});

loadProfile();