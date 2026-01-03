// ===== PRODUCTS =====
const productForm = document.getElementById("productForm");
const productTableBody = document.querySelector("#productTable tbody");

productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("productName").value.trim();
  const price = parseFloat(document.getElementById("productPrice").value);
  const quantity = parseInt(document.getElementById("productQuantity").value);

  if (!name || isNaN(price) || isNaN(quantity)) {
    alert("⚠️ Please fill in all product fields correctly.");
    return;
  }

  try {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price, quantity }),
    });

    if (res.ok) {
      productForm.reset();
      loadProducts();
    } else {
      alert("❌ Failed to add product.");
    }
  } catch (error) {
    console.error(error);
    alert("⚠️ Could not connect to server.");
  }
});

async function loadProducts() {
  try {
    const res = await fetch("/api/products");
    const products = await res.json();

    productTableBody.innerHTML = "";

    if (products.length === 0) {
      productTableBody.innerHTML = `<tr><td colspan="4">No products found</td></tr>`;
      return;
    }


    const orderProduct = document.getElementById("orderProduct");
    orderProduct.innerHTML = `<option value="">-- Select Product --</option>`;

    products.forEach((p) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${p.name}</td>
        <td>${p.price}</td>
        <td>${p.quantity}</td>
        <td><button onclick="deleteProduct('${p._id}')">Delete</button></td>
      `;
      productTableBody.appendChild(row);

      orderProduct.innerHTML += `<option value="${p._id}">${p.name}</option>`;
    });
  } catch (error) {
    console.error(error);
    productTableBody.innerHTML = `<tr><td colspan="4">⚠️ Failed to load products</td></tr>`;
  }
}

async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  try {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) loadProducts();
  } catch (error) {
    console.error(error);
  }
}

// ===== CUSTOMERS =====
const customerForm = document.getElementById("customerForm");
const customerTableBody = document.querySelector("#customerTable tbody");

customerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("customerName").value.trim();
  const email = document.getElementById("customerEmail").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const address = document.getElementById("customerAddress").value.trim();

  if (!name || !email || !phone || !address) {
    alert("⚠️ Fill in all customer fields.");
    return;
  }

  try {
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, address }),
    });

    if (res.ok) {
      customerForm.reset();
      loadCustomers();
    }
  } catch (error) {
    console.error(error);
  }
});

async function loadCustomers() {
  try {
    const res = await fetch("/api/customers");
    const customers = await res.json();

    customerTableBody.innerHTML = "";

    if (customers.length === 0) {
      customerTableBody.innerHTML = `<tr><td colspan="5">No customers found</td></tr>`;
      return;
    }

    
    const orderCustomer = document.getElementById("orderCustomer");
    orderCustomer.innerHTML = `<option value="">-- Select Customer --</option>`;

    customers.forEach((c) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${c.name}</td>
        <td>${c.email}</td>
        <td>${c.phone}</td>
        <td>${c.address}</td>
        <td><button onclick="deleteCustomer('${c._id}')">Delete</button></td>
      `;
      customerTableBody.appendChild(row);

      orderCustomer.innerHTML += `<option value="${c._id}">${c.name}</option>`;
    });
  } catch (error) {
    console.error(error);
  }
}

async function deleteCustomer(id) {
  if (!confirm("Delete this customer?")) return;
  try {
    const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
    if (res.ok) loadCustomers();
  } catch (error) {
    console.error(error);
  }
}

// ===== ORDERS =====
const orderForm = document.getElementById("orderForm");
const orderTableBody = document.querySelector("#orderTable tbody");

orderForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const customerId = document.getElementById("orderCustomer").value;
  const productId = document.getElementById("orderProduct").value;
  const quantity = parseInt(document.getElementById("orderQuantity").value);

  if (!customerId || !productId || isNaN(quantity) || quantity <= 0) {
    alert("⚠️ Select customer, product and enter quantity.");
    return;
  }

  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, productId, quantity }),
    });

    if (res.ok) {
      orderForm.reset();
      loadOrders();
      loadReports();
    }
  } catch (error) {
    console.error(error);
  }
});

async function loadOrders() {
  try {
    const res = await fetch("/api/orders");
    const orders = await res.json();

    orderTableBody.innerHTML = "";

    if (orders.length === 0) {
      orderTableBody.innerHTML = `<tr><td colspan="6">No orders found</td></tr>`;
      return;
    }

    orders.forEach((o) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${o.customerName}</td>
        <td>${o.productName}</td>
        <td>${o.quantity}</td>
        <td>${o.totalPrice}</td>
        <td>${new Date(o.date).toLocaleDateString()}</td>
        <td>
          <button onclick="deleteOrder('${o._id}')">Delete</button>
          <button onclick='generateInvoice(${JSON.stringify(o)})'>Invoice</button>
        </td>
      `;
      orderTableBody.appendChild(row);
    });
  } catch (error) {
    console.error(error);
  }
}

async function deleteOrder(id) {
  if (!confirm("Delete this order?")) return;
  try {
    const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
    if (res.ok) {
      loadOrders();
      loadReports();
    }
  } catch (error) {
    console.error(error);
  }
}

// ===== INVOICING =====
function generateInvoice(order) {
  const invoiceWindow = window.open("", "_blank");
  invoiceWindow.document.write(`
    <html>
      <head><title>Invoice - ${order._id}</title></head>
      <body>
        <h1>Invoice</h1>
        <p><b>Invoice ID:</b> ${order._id}</p>
        <p><b>Date:</b> ${new Date(order.date).toLocaleDateString()}</p>
        <hr>
        <p><b>Customer:</b> ${order.customerName}</p>
        <p><b>Product:</b> ${order.productName}</p>
        <p><b>Quantity:</b> ${order.quantity}</p>
        <p><b>Total Price:</b> $${order.totalPrice}</p>
        <hr>
        <p>Thank you for your business!</p>
        <button onclick="window.print()">🖨️ Print Invoice</button>
      </body>
    </html>
  `);
  invoiceWindow.document.close();
}

// ===== REPORTS =====
async function loadReports() {
  try {
    const res = await fetch("/api/reports/sales");
    const report = await res.json();

    document.getElementById("salesReport").innerHTML = `
      <h3>Sales Report</h3>
      <p><b>Total Sales:</b> $${report.totalSales}</p>
      <p><b>Total Orders:</b> ${report.totalOrders}</p>
      <p><b>Best Product:</b> ${report.bestProduct}</p>
      <p><b>Top Customer:</b> ${report.topCustomer}</p>
    `;
  } catch (error) {
    console.error(error);
    document.getElementById("salesReport").innerHTML =
      "⚠️ Failed to load report.";
  }
}

// ===== INIT =====
window.onload = () => {
  loadProducts();
  loadCustomers();
  loadOrders();
  loadReports();
};
