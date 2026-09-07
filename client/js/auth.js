// Modal-based auth UI and client for /api/auth

const authBtn = document.getElementById("authBtn");
const authBtnText = document.getElementById("authBtnText");
const userNameEl = document.querySelector(".user-info h4");
const userEmailEl = document.querySelector(".user-info p");

const authModal = document.getElementById("authModal");
const authClose = document.getElementById("authClose");
const authTitle = document.getElementById("authTitle");
const authForm = document.getElementById("authForm");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authSubmit = document.getElementById("authSubmit");
const switchAuth = document.getElementById("switchAuth");
const authError = document.getElementById("authError");

let currentUser = JSON.parse(localStorage.getItem("user")) || null;
let token = localStorage.getItem("token") || null;
let authMode = "login"; // or 'register'

function updateAuthUI() {
  if (currentUser && token) {
    authBtnText.textContent = "Logout";
    userNameEl.textContent = "Logged in";
    userEmailEl.textContent = currentUser.email;
  } else {
    authBtnText.textContent = "Login";
    userNameEl.textContent = "User";
    userEmailEl.textContent = "user@example.com";
  }
}

function openAuthModal(mode = "login") {
  authMode = mode;
  authTitle.textContent = mode === "login" ? "Login" : "Register";
  authSubmit.textContent = mode === "login" ? "Login" : "Register";
  switchAuth.textContent =
    mode === "login" ? "Switch to Register" : "Switch to Login";
  authError.textContent = "";
  authEmail.value = "";
  authPassword.value = "";
  authModal.classList.remove("hidden");
  authEmail.focus();
}

function closeAuthModal() {
  authModal.classList.add("hidden");
}

authBtn.addEventListener("click", (e) => {
  // prevent default so we can control navigation when logged in
  if (e && typeof e.preventDefault === "function") e.preventDefault();

  if (currentUser && token) {
    // logout
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    currentUser = null;
    token = null;
    updateAuthUI();
    return;
  }

  // navigate to dedicated login page
  window.location.href = "/login.html";
});

authClose.addEventListener("click", closeAuthModal);

authModal.addEventListener("click", (e) => {
  if (e.target === authModal) closeAuthModal();
});

switchAuth.addEventListener("click", () => {
  openAuthModal(authMode === "login" ? "register" : "login");
});

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = authEmail.value.trim();
  const password = authPassword.value;

  if (!email || !password) {
    authError.textContent = "Email and password are required";
    return;
  }

  try {
    authSubmit.disabled = true;
    const res = await fetch(`/api/auth/${authMode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      authError.textContent = data.message || "Authentication failed";
      authSubmit.disabled = false;
      return;
    }

    token = data.token;
    currentUser = data.user;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(currentUser));
    updateAuthUI();
    closeAuthModal();
  } catch (err) {
    console.error(err);
    authError.textContent = "Network error";
  } finally {
    authSubmit.disabled = false;
  }
});

updateAuthUI();

// expose helper to get auth header
window.getAuthHeader = function () {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};
