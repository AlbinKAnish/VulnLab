const token = localStorage.getItem("token");
const currentUser = JSON.parse(localStorage.getItem("user"));

if (!token || !currentUser) {
    window.location.href = "login.html";
}

const currentUserRole = currentUser.role
    ? currentUser.role.toLowerCase().trim()
    : "";

if (currentUserRole !== "admin") {
    alert("Admin access only");
    window.location.href = "dashboard.html";
}

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
    });
}

let users = [];
let labStats = [];


// =====================
// Helper Functions
// =====================

function getInitial(username) {
    return username ? username.charAt(0).toUpperCase() : "U";
}

function getSolvedText(user) {
    return `${user.solvedCount}/${user.totalLabs}`;
}

function formatTime(value) {
    if (!value) {
        return "No recent activity";
    }

    return new Date(value).toLocaleString();
}

function showError(message) {
    alert(message);
}


// =====================
// Load Admin Overview
// =====================

async function loadAdminOverview() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/overview`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load admin overview");
        }

        users = data.users || [];

        document.getElementById("totalUsers").textContent =
            data.stats.totalUsers;

        document.getElementById("totalSolves").textContent =
            data.stats.totalSolves;

        document.getElementById("totalXp").textContent =
            data.stats.totalXp;

        document.getElementById("topRank").textContent =
            data.stats.topRank;

        document.getElementById("completionRate").textContent =
            `${data.stats.completionRate}%`;

        document.getElementById("topLearner").textContent =
            data.stats.topLearner;

        document.getElementById("newestUser").textContent =
            users.length > 0
                ? users[users.length - 1].username
                : "-";

        loadUsers(users);
    } catch (err) {
        console.error("Admin overview error:", err);

        document.getElementById("usersTableBody").innerHTML = `
            <tr>
                <td colspan="7">
                    Unable to load admin data.
                </td>
            </tr>
        `;

        showError(err.message);
    }
}


// =====================
// User Table
// =====================

const tableBody = document.getElementById("usersTableBody");

function loadUsers(userList) {

    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (!userList || userList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    No users found.
                </td>
            </tr>
        `;
        return;
    }

    userList.forEach(user => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <div class="user-cell">
                    <div class="user-avatar">
                        ${getInitial(user.username)}
                    </div>

                    <div class="user-meta">
                        <strong>${user.username}</strong>
                        <span>${user.email}</span>
                    </div>
                </div>
            </td>

            <td>
                <span class="role-pill">
                    ${user.role}
                </span>
            </td>

            <td>${user.xp}</td>

            <td>${getSolvedText(user)}</td>

            <td>
                <span class="rank-pill">
                    ${user.rank}
                </span>
            </td>

            <td>
                <span class="status-pill">
                    ${user.status}
                </span>
            </td>

            <td>
                <div class="admin-actions">

                    <button
                        class="small-btn"
                        onclick="viewUser(${user.id})"
                        title="View User">
                        👁
                    </button>

                    <button
                        class="small-btn"
                        onclick="editUser(${user.id})"
                        title="Edit User">
                        ✏
                    </button>

                    <button
                        class="small-btn"
                        onclick="grantXp(${user.id})"
                        title="Grant XP">
                        ⚡
                    </button>

                    <button
                        class="small-btn"
                        onclick="resetUserPassword(${user.id})"
                        title="Reset Password">
                        🔑
                    </button>

                    <button
                        class="small-btn danger"
                        onclick="resetProgress(${user.id})"
                        title="Reset Progress">
                        🔄
                    </button>

                    <button
                        class="small-btn danger"
                        onclick="deleteUser(${user.id})"
                        title="Delete User">
                        🗑
                    </button>

                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });
}


// =====================
// Search Users
// =====================

const userSearch = document.getElementById("userSearch");

if (userSearch) {
    userSearch.addEventListener("input", (e) => {

        const search = e.target.value.toLowerCase();

        const filtered = users.filter(user =>
            user.username.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search) ||
            user.role.toLowerCase().includes(search) ||
            user.rank.toLowerCase().includes(search)
        );

        loadUsers(filtered);
    });
}


// =====================
// Load Lab Analytics
// =====================

async function loadLabAnalytics() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/admin/analytics`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Unable to load analytics"
            );
        }

        labStats = data.analytics || [];

        document.getElementById("mostSolvedLab").textContent =
            data.mostSolvedLab || "-";

        document.getElementById("leastSolvedLab").textContent =
            data.leastSolvedLab || "-";

        const analytics =
            document.getElementById("labAnalytics");

        analytics.innerHTML = "";

        if (labStats.length === 0) {
            analytics.innerHTML =
                "No analytics available.";
            return;
        }

        labStats.forEach((lab) => {

            const item = document.createElement("div");

            item.className = "analytics-item";

            item.innerHTML = `
                <div class="analytics-top">
                    <span>${lab.name}</span>
                    <strong>${lab.percentage}%</strong>
                </div>

                <div class="analytics-sub">
                    ${lab.solved}/${lab.totalUsers} users solved
                </div>

                <div class="analytics-bar">
                    <div
                        class="analytics-fill"
                        style="width:${lab.percentage}%">
                    </div>
                </div>
            `;

            analytics.appendChild(item);
        });

    } catch (err) {

        console.error("Analytics error:", err);

        document.getElementById("labAnalytics").innerHTML =
            "Unable to load analytics.";

        showError(err.message);
    }
}


// =====================
// Load Lab Monitor
// =====================

async function loadLabMonitor() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/lab-monitor`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load lab monitor");
        }

        const table = document.getElementById("labMonitorTable");

        if (!table) return;

        table.innerHTML = "";

        if (!data.records || data.records.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="4">
                        No lab activity found.
                    </td>
                </tr>
            `;
            return;
        }

        data.records.forEach((record) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>
                    <strong>${record.username}</strong>
                </td>

                <td>${record.email}</td>

                <td>
                    <span class="role-pill">
                        ${record.labName}
                    </span>
                </td>

                <td>${formatTime(record.solvedAt)}</td>
            `;

            table.appendChild(row);
        });

    } catch (err) {
        console.error("Lab monitor error:", err);

        const table = document.getElementById("labMonitorTable");

        if (table) {
            table.innerHTML = `
                <tr>
                    <td colspan="4">
                        Unable to load monitor data.
                    </td>
                </tr>
            `;
        }
    }
}


// =====================
// Load Activity Feed
// =====================

async function loadActivityFeed() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/activity`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load activity");
        }

        const activityFeed = document.getElementById("activityFeed");

        if (!activityFeed) return;

        activityFeed.innerHTML = "";

        if (!data.activity || data.activity.length === 0) {
            activityFeed.innerHTML = `
                <div class="activity-item">
                    <strong>No activity yet</strong>
                    <p>Solved labs will appear here.</p>
                </div>
            `;
            return;
        }

        data.activity.forEach((item) => {
            const activity = document.createElement("div");

            activity.className = "activity-item";

            activity.innerHTML = `
                <strong>${item.username}</strong>
                <p>${item.action}</p>
                <p>${formatTime(item.time)}</p>
            `;

            activityFeed.appendChild(activity);
        });

    } catch (err) {
        console.error("Activity error:", err);

        const activityFeed = document.getElementById("activityFeed");

        if (activityFeed) {
            activityFeed.innerHTML = "Unable to load activity.";
        }

        showError(err.message);
    }
}


// =====================
// Load Admin Audit Logs
// =====================

async function loadAdminLogs() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/logs`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load admin logs");
        }

        const logsBox = document.getElementById("adminLogs");

        if (!logsBox) return;

        logsBox.innerHTML = "";

        if (!data.logs || data.logs.length === 0) {
            logsBox.innerHTML = `
                <div class="audit-log-item">
                    <div class="audit-log-top">
                        <span>No admin logs yet</span>
                        <strong>-</strong>
                    </div>

                    <div class="audit-log-details">
                        Admin actions will appear here after editing users, granting XP, resetting progress, or deleting users.
                    </div>
                </div>
            `;
            return;
        }

        data.logs.forEach((log) => {
            const item = document.createElement("div");

            item.className = "audit-log-item";

            item.innerHTML = `
                <div class="audit-log-top">
                    <span>
                        <span class="log-action-pill">
                            ${log.action}
                        </span>
                    </span>

                    <strong>
                        ${formatTime(log.created_at)}
                    </strong>
                </div>

                <div class="audit-log-sub">
                    Admin:
                    ${log.admin_username || "Unknown"}
                    |
                    Target:
                    ${log.target_username || "Deleted User"}
                </div>

                <div class="audit-log-details">
                    ${log.details || "No details available"}
                </div>
            `;

            logsBox.appendChild(item);
        });

    } catch (err) {
        console.error("Admin logs error:", err);

        const logsBox = document.getElementById("adminLogs");

        if (logsBox) {
            logsBox.innerHTML = "Unable to load admin logs.";
        }

        showError(err.message);
    }
}


// =====================
// Export Users CSV
// =====================

async function exportUsersCsv() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/export-users`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Unable to export users");
        }

        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = "vulnlab_users_report.csv";

        document.body.appendChild(link);

        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);

        await loadAdminLogs();

    } catch (err) {
        alert(err.message);
    }
}

// =====================
// Create User / Admin
// =====================

function createUserFromAdmin() {
    document.getElementById("createUserModal").classList.add("active");
}

document.getElementById("closeCreateUserModal")
.addEventListener("click", () => {
    document.getElementById("createUserModal").classList.remove("active");
    document.getElementById("createUserForm").reset();
    document.getElementById("createUserMessage").textContent = "";
});

document.getElementById("createUserForm")
.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("createUsername").value.trim();
    const email = document.getElementById("createEmail").value.trim();
    const password = document.getElementById("createPassword").value;
    const role = document.getElementById("createRole").value;

    const messageBox = document.getElementById("createUserMessage");

    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                username,
                email,
                password,
                role
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to create account");
        }

        messageBox.style.color = "#22c55e";
        messageBox.textContent = `${role} created successfully.`;

        await loadAdminOverview();
        await loadLabAnalytics();
        await loadLabMonitor();
        await loadActivityFeed();
        await loadAdminLogs();

        setTimeout(() => {
            document.getElementById("createUserModal").classList.remove("active");
            document.getElementById("createUserForm").reset();
            messageBox.textContent = "";
        }, 900);

    } catch (err) {
        messageBox.style.color = "#ef4444";
        messageBox.textContent = err.message;
    }
});


// =====================
// Admin Actions
// =====================

function viewUser(userId) {
    const user = users.find(item => item.id === userId);

    if (!user) {
        alert("User not found");
        return;
    }

    alert(
        `User Details\n\n` +
        `Username: ${user.username}\n` +
        `Email: ${user.email}\n` +
        `Role: ${user.role}\n` +
        `Lab XP: ${user.labXp || 0}\n` +
        `Bonus XP: ${user.bonusXp || 0}\n` +
        `Total XP: ${user.xp}\n` +
        `Solved: ${user.solvedCount}/${user.totalLabs}\n` +
        `Rank: ${user.rank}`
    );
}

async function editUser(userId) {
    const user = users.find(item => item.id === userId);

    if (!user) {
        alert("User not found");
        return;
    }

    const username = prompt("Username:", user.username);

    if (!username) {
        return;
    }

    const email = prompt("Email:", user.email);

    if (!email) {
        return;
    }

    const role = prompt("Role (user/admin):", user.role);

    if (!role) {
        return;
    }

    const cleanRole = role.toLowerCase().trim();

    if (cleanRole !== "user" && cleanRole !== "admin") {
        alert("Invalid role. Use only user or admin.");
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/admin/users/${userId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: username.trim(),
                    email: email.trim(),
                    role: cleanRole
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to update user");
        }

        alert("User updated successfully.");

        await loadAdminOverview();
        await loadLabAnalytics();
        await loadLabMonitor();
        await loadActivityFeed();
        await loadAdminLogs();

    } catch (err) {
        alert(err.message);
    }
}

async function grantXp(userId) {
    const user = users.find(item => item.id === userId);

    if (!user) {
        alert("User not found");
        return;
    }

    const xpInput = prompt(
        `Grant XP to ${user.username}\n\nEnter XP amount:`,
        "100"
    );

    if (xpInput === null) {
        return;
    }

    const xpAmount = Number(xpInput);

    if (!xpAmount || xpAmount <= 0) {
        alert("Please enter a valid XP amount greater than 0.");
        return;
    }

    if (xpAmount > 1000) {
        alert("Maximum allowed XP grant is 1000.");
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/admin/users/${userId}/grant-xp`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    xp: xpAmount
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to grant XP");
        }

        alert(`${xpAmount} XP granted successfully to ${user.username}.`);

        await loadAdminOverview();
        await loadLabAnalytics();
        await loadLabMonitor();
        await loadActivityFeed();
        await loadAdminLogs();

    } catch (err) {
        alert(err.message);
    }
}

// =====================
// Reset User Password
// =====================

async function resetUserPassword(userId) {
    const user = users.find(item => item.id === userId);

    if (!user) {
        alert("User not found");
        return;
    }

    const newPassword = prompt(
        `Reset password for ${user.username}\n\nEnter new password:`
    );

    if (!newPassword) {
        return;
    }

    if (newPassword.length < 8) {
        alert("Password must be at least 8 characters.");
        return;
    }

    const confirmReset = confirm(
        `Are you sure you want to reset password for ${user.username}?`
    );

    if (!confirmReset) {
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/admin/users/${userId}/password`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    newPassword
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Unable to reset password"
            );
        }

        alert(`Password reset successfully for ${user.username}`);

        await loadAdminLogs();

    } catch (err) {
        alert(err.message);
    }
}

async function resetProgress(userId) {
    const confirmReset = confirm(
        "Are you sure you want to reset this user's progress and bonus XP?"
    );

    if (!confirmReset) {
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/admin/users/${userId}/progress`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to reset progress");
        }

        alert("User progress and bonus XP reset successfully.");

        await loadAdminOverview();
        await loadLabAnalytics();
        await loadLabMonitor();
        await loadActivityFeed();
        await loadAdminLogs();

    } catch (err) {
        alert(err.message);
    }
}

async function deleteUser(userId) {
    if (userId === currentUser.id) {
        alert("You cannot delete your own admin account.");
        return;
    }

    const confirmDelete = confirm(
        "Are you sure you want to delete this user? This will also delete their progress."
    );

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/admin/users/${userId}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to delete user");
        }

        alert("User deleted successfully.");

        await loadAdminOverview();
        await loadLabAnalytics();
        await loadLabMonitor();
        await loadActivityFeed();
        await loadAdminLogs();

    } catch (err) {
        alert(err.message);
    }
}

// =====================
// Quick Actions
// =====================

document.querySelectorAll(".quick-action-card")
.forEach((card) => {

    const text = card.innerText.toLowerCase();

    card.addEventListener("click", () => {

        if (text.includes("create admin")) {
            createUserFromAdmin();
            return;
        }

        if (text.includes("export users")) {
            exportUsersCsv();
            return;
        }

        if (text.includes("lab monitor")) {

            const section =
                document.getElementById("labMonitorSection");

            if (section) {
                section.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

            loadLabMonitor();
            return;
        }

        alert(
            "This quick action will be connected in the next phase."
        );
    });
});


// =====================
// Initial Load
// =====================

async function initAdminDashboard() {

    await loadAdminOverview();
    await loadLabAnalytics();
    await loadLabMonitor();
    await loadActivityFeed();
    await loadAdminLogs();

    console.log(
        "Admin Dashboard connected to PostgreSQL"
    );
}

initAdminDashboard();