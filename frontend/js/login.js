document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value;

    if (!username || !password || !role) {
      alert("⚠️ Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch("/api/login", {   
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Login successful!");

        // Redirect based on role
        if (role === "admin") {
          window.location.href = "/admin-dashboard.html";
        } else if (role === "supplier") {
          window.location.href = "/supplier-dashboard.html";
        } else if (role === "customer") {
          window.location.href = "/customer-dashboard.html";
        }
      } else {
        alert("❌ Login failed: " + (data.message || "Invalid credentials"));
      }
    } catch (error) {
      alert("⚠️ Error connecting to server: " + error.message);
    }
  });
});

