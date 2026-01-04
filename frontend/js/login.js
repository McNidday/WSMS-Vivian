document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");
  const messageEl = document.getElementById("loginMessage");

  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();
      const role = document.getElementById("role").value;

      if (!username || !password || !role) {
        showMessage("⚠️ Please fill in all fields.", "error");
        return;
      }

      try {
        const response = await fetch("/api/auth/login", {   
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password, role }),
        });

        const data = await response.json();

        if (response.ok) {
          showMessage("✅ Login successful! Redirecting...", "success");
          
          // Store token if provided
          if (data.token) {
            localStorage.setItem("token", data.token);
          }

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            window.location.href = "dashboard.html";
          }, 1000);
        } else {
          showMessage("❌ " + (data.message || "Invalid credentials"), "error");
        }
      } catch (error) {
        showMessage("⚠️ Error connecting to server: " + error.message, "error");
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

