document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const messageEl = document.getElementById("message");

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

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
          messageEl.style.color = "green";
          messageEl.textContent = data.message || "Registration successful!";
          registerForm.reset();
        } else {
          messageEl.style.color = "red";
          messageEl.textContent = data.message || "Registration failed!";
        }
      } catch (err) {
        console.error("Error:", err);
        messageEl.style.color = "red";
        messageEl.textContent = "Server error! Please try again later.";
      }
    });
  }
});


