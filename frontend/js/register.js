document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const messageEl = document.getElementById("registerMessage");

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();
      const confirmPassword = document.getElementById("confirmPassword").value.trim();

      if (!username || !password) {
        showMessage("⚠️ Please fill in all fields.", "error");
        return;
      }

      if (password !== confirmPassword) {
        showMessage("❌ Passwords do not match!", "error");
        return;
      }

      if (password.length < 6) {
        showMessage("❌ Password must be at least 6 characters long.", "error");
        return;
      }

      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
          showMessage("✅ " + (data.message || "Registration successful! Redirecting to login..."), "success");
          registerForm.reset();
          
          setTimeout(() => {
            window.location.href = "login.html";
          }, 2000);
        } else {
          showMessage("❌ " + (data.message || "Registration failed!"), "error");
        }
      } catch (err) {
        console.error("Error:", err);
        showMessage("⚠️ Server error! Please try again later.", "error");
      }
    });
  }

  function showMessage(text, type) {
    if (messageEl) {
      messageEl.textContent = text;
      messageEl.className = `theme-message ${type}`;
      messageEl.style.display = "block";
    }
  }
});


