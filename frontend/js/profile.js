const token = localStorage.getItem("token");
let currentUser = JSON.parse(localStorage.getItem("user"));

if (!token || !currentUser) {
    window.location.href = "login.html";
}

const labs = [
    { key: "lab_sqli", name: "SQL Injection" },
    { key: "lab_xss", name: "Stored XSS" },
    { key: "lab_idor", name: "IDOR" },
    { key: "lab_jwt", name: "JWT Privilege Escalation" },
    { key: "lab_path", name: "Path Traversal" },
    { key: "lab_csrf", name: "CSRF" },
    { key: "lab_cmdi", name: "Command Injection" },
    { key: "lab_ssrf", name: "SSRF" },
    { key: "lab_upload", name: "File Upload" }
];

document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
});

function setMessage(elementId, message, success = true) {
    const element = document.getElementById(elementId);

    element.style.color = success ? "#22c55e" : "#ef4444";
    element.textContent = message;
}

function formatTime(value) {
    if (!value) {
        return "No recent activity";
    }

    return new Date(value).toLocaleString();
}

function updateBasicProfile(profile) {
    const completion =
        profile.totalLabs > 0
        ? Math.round((profile.solvedCount / profile.totalLabs) * 100)
        : 0;

    const remaining =
        profile.totalLabs - profile.solvedCount;

    document.getElementById("profileSubtitle").textContent =
        `Welcome back, ${profile.username}`;

    document.getElementById("profileName").textContent =
        profile.username;

    document.getElementById("profileEmail").textContent =
        `Email: ${profile.email}`;

    document.getElementById("profileRole").textContent =
        `Role: ${profile.role}`;

    document.getElementById("profileLastActivity").textContent =
        `Last Activity: ${formatTime(profile.lastActivity)}`;

    document.getElementById("profileAvatar").textContent =
        profile.username.charAt(0).toUpperCase();

    document.getElementById("profileRank").textContent =
        `Rank: ${profile.rank}`;

    document.getElementById("profileScore").textContent =
        `${completion}%`;

    document.getElementById("profileProgressFill").style.width =
        `${completion}%`;

    document.getElementById("profileProgressText").textContent =
        `Completed: ${profile.solvedCount}/${profile.totalLabs} Labs`;

    document.getElementById("profileSolved").textContent =
        profile.solvedCount;

    document.getElementById("profileRemaining").textContent =
        remaining;

    document.getElementById("profileTotal").textContent =
        profile.totalLabs;

    document.getElementById("profileLabXp").textContent =
        profile.labXp;

    document.getElementById("profileBonusXp").textContent =
        profile.bonusXp;

    document.getElementById("profileXp").textContent =
        profile.totalXp;

    document.getElementById("profileId").textContent =
        profile.id;

    document.getElementById("profileAccountType").textContent =
        profile.role;

    document.getElementById("profileStatus").textContent =
        profile.solvedCount === profile.totalLabs
        ? "Excellent! You completed all available labs."
        : "Keep solving labs to improve your rank.";

    document.getElementById("updateUsername").value =
        profile.username;

    document.getElementById("updateEmail").value =
        profile.email;
}

async function loadProfile() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load profile");
        }

        updateBasicProfile(data.profile);

    } catch (err) {
        console.error("Profile load error:", err);

        document.getElementById("profileSubtitle").textContent =
            "Unable to load profile";
    }
}

async function loadProfileProgress() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/progress`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load progress");
        }

        const solvedKeys =
            data.progress.map(item => item.lab_key);

        const solvedLabsList =
            document.getElementById("solvedLabsList");

        solvedLabsList.innerHTML = "";

        labs.forEach((lab) => {
            const item =
            document.createElement("div");

            const isSolved =
            solvedKeys.includes(lab.key);

            item.className =
            isSolved
            ? "profile-lab-item profile-lab-done"
            : "profile-lab-item profile-lab-pending";

            item.innerHTML = `
                <span>${isSolved ? "✓" : "○"} ${lab.name}</span>
                <strong>${isSolved ? "Solved" : "Pending"}</strong>
            `;

            solvedLabsList.appendChild(item);
        });

    } catch (err) {
        console.error("Profile progress error:", err);

        document.getElementById("solvedLabsList").innerHTML =
            "Unable to load solved labs.";
    }
}

document.getElementById("profileUpdateForm")
.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username =
    document.getElementById("updateUsername").value.trim();

    const email =
    document.getElementById("updateEmail").value.trim();

    if (!username || !email) {
        setMessage(
            "profileUpdateMessage",
            "Username and email are required.",
            false
        );
        return;
    }

    try {
        const response =
        await fetch(`${API_BASE_URL}/api/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                username,
                email
            })
        });

        const data =
        await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to update profile");
        }

        currentUser = {
            ...currentUser,
            username: data.user.username,
            email: data.user.email,
            role: data.user.role
        };

        localStorage.setItem(
            "user",
            JSON.stringify(currentUser)
        );

        setMessage(
            "profileUpdateMessage",
            "Profile updated successfully.",
            true
        );

        await loadProfile();

    } catch (err) {
        setMessage(
            "profileUpdateMessage",
            err.message,
            false
        );
    }
});

document.getElementById("passwordUpdateForm")
.addEventListener("submit", async (e) => {
    e.preventDefault();

    const currentPassword =
    document.getElementById("currentPassword").value;

    const newPassword =
    document.getElementById("newPassword").value;

    const confirmPassword =
    document.getElementById("confirmPassword").value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        setMessage(
            "passwordUpdateMessage",
            "All password fields are required.",
            false
        );
        return;
    }

    if (newPassword !== confirmPassword) {
        setMessage(
            "passwordUpdateMessage",
            "New passwords do not match.",
            false
        );
        return;
    }

    if (newPassword.length < 6) {
        setMessage(
            "passwordUpdateMessage",
            "New password must be at least 6 characters.",
            false
        );
        return;
    }

    try {
        const response =
        await fetch(`${API_BASE_URL}/api/profile/password`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        const data =
        await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to update password");
        }

        setMessage(
            "passwordUpdateMessage",
            "Password updated successfully.",
            true
        );

        document.getElementById("passwordUpdateForm").reset();

    } catch (err) {
        setMessage(
            "passwordUpdateMessage",
            err.message,
            false
        );
    }
});

async function initProfilePage() {
    await loadProfile();
    await loadProfileProgress();
}

initProfilePage();