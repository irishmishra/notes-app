// Shared script for login.html and register.html
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  async function handleSubmit(e, mode) {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector("input[type=email]").value.trim();
    const password = form.querySelector("input[type=password]").value;
    const errorEl = form.querySelector(".auth-error");

    errorEl.textContent = "";
    if (!email || !password) {
      errorEl.textContent = "Email and password are required";
      return;
    }

    // basic email format check
    function validEmail(e) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    }

    function validatePassword(pw) {
      if (pw.length < 8) return "Password must be at least 8 characters";
      if (!/[0-9]/.test(pw)) return "Password must include at least one number";
      if (!/[a-zA-Z]/.test(pw)) return "Password must include letters";
      // optional: require special char
      // if (!/[!@#\$%\^&\*]/.test(pw)) return 'Password should include a special character';
      return null;
    }

    if (!validEmail(email)) {
      errorEl.textContent = "Please enter a valid email address";
      return;
    }

    if (mode === "register") {
      const pwErr = validatePassword(password);
      if (pwErr) {
        errorEl.textContent = pwErr;
        return;
      }
    }

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        errorEl.textContent = data.message || "Authentication failed";
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      // redirect to app
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      errorEl.textContent = "Network error";
    }
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => handleSubmit(e, "login"));
  }

  if (registerForm) {
    registerForm.addEventListener("submit", (e) => handleSubmit(e, "register"));
  }
});
