const paymentForm = document.getElementById("paymentForm");
const messageBox = document.getElementById("paymentMessage");

paymentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("payerName").value.trim();
  const email = document.getElementById("payerEmail").value.trim();
  const amount = parseFloat(document.getElementById("paymentAmount").value);
  const method = document.getElementById("paymentMethod").value;

  // ✅ Validation
  if (!name || !email || isNaN(amount) || amount <= 0 || !method) {
    messageBox.style.color = "red";
    messageBox.textContent = "⚠️ Please fill in all fields correctly.";
    return;
  }

  
  const allowedMethods = ["cash", "mpesa", "paypal", "bank", "card"];
  if (!allowedMethods.includes(method.toLowerCase())) {
    messageBox.style.color = "red";
    messageBox.textContent = "❌ Invalid payment method selected.";
    return;
  }

  try {
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        amount,
        method,
        status: "pending", // 👈 default until processed
      }),
    });

    const data = await res.json();

    if (res.ok) {
      messageBox.style.color = "green";
      messageBox.textContent = `✅ Payment of KES ${amount} via ${method.toUpperCase()} recorded successfully!`;
      paymentForm.reset();
    } else {
      messageBox.style.color = "red";
      messageBox.textContent =
        "❌ Error: " + (data.message || "Failed to process payment.");
    }
  } catch (error) {
    messageBox.style.color = "red";
    messageBox.textContent =
      "⚠️ Could not connect to server. " + error.message;
  }
});
