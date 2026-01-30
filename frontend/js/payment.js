const paymentForm = document.getElementById("paymentForm");
const messageBox = document.getElementById("paymentMessage");
let customers = [];
let orders = [];

// Load customers and orders on page load
async function loadCustomers() {
  try {
    const res = await fetch("/api/customers");
    customers = await res.json();

    const customerSelect = document.getElementById("paymentCustomer");
    if (customerSelect) {
      customerSelect.innerHTML =
        '<option value="">-- Select Customer --</option>';
      customers.forEach((c) => {
        customerSelect.innerHTML += `<option value="${c._id}">${c.name} (${c.email})</option>`;
      });
    }
  } catch (error) {
    console.error("Error loading customers:", error);
  }
}

async function loadOrders() {
  try {
    const res = await fetch("/api/orders");
    orders = await res.json();

    const orderSelect = document.getElementById("paymentOrder");
    if (orderSelect) {
      orderSelect.innerHTML =
        '<option value="">-- Select Order (Optional) --</option>';
      orders
        .filter((o) => o.status !== "paid" && o.status !== "cancelled")
        .forEach((o) => {
          orderSelect.innerHTML += `<option value="${o._id}" data-amount="${o.totalAmount}">Order #${o._id.slice(-6)} - KSH ${o.totalAmount}</option>`;
        });
    }
  } catch (error) {
    console.error("Error loading orders:", error);
  }
}

// Auto-fill amount when order is selected
const orderSelect = document.getElementById("paymentOrder");
if (orderSelect) {
  orderSelect.addEventListener("change", (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    if (selectedOption.value && selectedOption.dataset.amount) {
      document.getElementById("paymentAmount").value =
        selectedOption.dataset.amount;
    }
  });
}

paymentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const customerId = document.getElementById("paymentCustomer")?.value;
  const orderId = document.getElementById("paymentOrder")?.value || null;
  const name = document.getElementById("payerName")?.value.trim() || "";
  const email = document.getElementById("payerEmail")?.value.trim() || "";
  const amount = parseFloat(document.getElementById("paymentAmount").value);
  const method = document.getElementById("paymentMethod").value;
  const description =
    document.getElementById("paymentDescription")?.value.trim() || "";

  // ✅ Validation
  if (!customerId || isNaN(amount) || amount <= 0 || !method) {
    messageBox.className = "theme-message error";
    messageBox.textContent = "⚠️ Please fill in all required fields correctly.";
    messageBox.style.display = "block";
    return;
  }

  const allowedMethods = ["cash", "mpesa", "paypal", "bank", "card"];
  if (!allowedMethods.includes(method.toLowerCase())) {
    messageBox.className = "theme-message error";
    messageBox.textContent = "❌ Invalid payment method selected.";
    messageBox.style.display = "block";
    return;
  }

  try {
    messageBox.className = "theme-message info";
    messageBox.textContent = "⏳ Processing payment...";
    messageBox.style.display = "block";
    console.log("Nidday is awesome goddamit!");
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        orderId: orderId || undefined,
        amount,
        method: method.toLowerCase(),
        payerName: name,
        payerEmail: email,
        description: description || `Payment via ${method}`,
      }),
    });

    const data = await res.json();
    console.log(data, "The data bitch ass nigga!");
    if (res.ok) {
      messageBox.className = "theme-message success";
      if (method.toLowerCase() === "paypal") {
        messageBox.textContent = `✅ PayPal payment initiated! Transaction ID: ${data.paypalTransactionId || "Pending"}. Status will be updated shortly.`;
      } else {
        messageBox.textContent = `✅ Payment of $${amount} via ${method.toUpperCase()} recorded successfully!`;
      }
      paymentForm.reset();
      if (orderId) {
        loadOrders(); // Reload orders to show updated status
      }
    } else {
      messageBox.className = "theme-message error";
      messageBox.textContent =
        "❌ Error: " + (data.message || "Failed to process payment.");
    }
  } catch (error) {
    messageBox.className = "theme-message error";
    messageBox.textContent = "⚠️ Could not connect to server. " + error.message;
    messageBox.style.display = "block";
  }
});

// Initialize on page load
window.addEventListener("DOMContentLoaded", () => {
  loadCustomers();
  loadOrders();
});
