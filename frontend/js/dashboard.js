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
      productTableBody.innerHTML = `<tr><td colspan="5">No products found</td></tr>`;
      return;
    }

    const orderProduct = document.getElementById("orderProduct");
    orderProduct.innerHTML = `<option value="">-- Select Product --</option>`;

    products.forEach((p) => {
      const row = document.createElement("tr");
      const stockStatus =
        p.quantity === 0
          ? '<span class="stock-out">Out of Stock</span>'
          : p.quantity < 10
            ? '<span class="stock-low">Low Stock</span>'
            : '<span class="stock-ok">In Stock</span>';
      row.innerHTML = `
        <td><strong>${p.name}</strong></td>
        <td>$${p.price.toFixed(2)}</td>
        <td>${p.quantity}</td>
        <td>${stockStatus}</td>
        <td class="action-buttons">
          <button class="btn-small btn-edit" onclick="editProduct('${p._id
        }')">Edit</button>
          <button class="btn-small btn-delete" onclick="deleteProduct('${p._id
        }')">Delete</button>
        </td>
      `;
      productTableBody.appendChild(row);

      orderProduct.innerHTML += `<option value="${p._id}">${p.name
        } ($${p.price.toFixed(2)})</option>`;
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
        <td><strong>${c.name}</strong></td>
        <td>${c.email}</td>
        <td>${c.phone || "N/A"}</td>
        <td>${c.address || "N/A"}</td>
        <td class="action-buttons">
          <button class="btn-small btn-history" onclick="viewCustomerHistory('${c._id
        }')">History</button>
          <button class="btn-small btn-edit" onclick="editCustomer('${c._id
        }')">Edit</button>
          <button class="btn-small btn-delete" onclick="deleteCustomer('${c._id
        }')">Delete</button>
        </td>
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
      body: JSON.stringify({
        customerId,
        productId,
        quantity: Number(quantity),
      }),
    });

    const data = await res.json();

    if (res.ok) {
      orderForm.reset();
      loadOrders();
      loadReports();
      loadProducts(); // Reload products to update stock
    } else {
      alert("❌ Error: " + (data.message || "Failed to create order"));
    }
  } catch (error) {
    console.error("Order creation error:", error);
    alert("⚠️ Failed to create order. Please try again.");
  }
});

async function loadOrders() {
  try {
    const res = await fetch("/api/orders");
    const orders = await res.json();
    console.log(orders, "The data we need to show in the order form");
    orderTableBody.innerHTML = "";

    if (orders.length === 0) {
      orderTableBody.innerHTML = `<tr><td colspan="7">No orders found</td></tr>`;
      return;
    }

    orders.forEach((o) => {
      const row = document.createElement("tr");
      const statusClass = `status-${(o.status || "pending").toLowerCase()}`;
      const statusBadge = `<span class="status-badge ${statusClass}">${(
        o.status || "pending"
      ).toUpperCase()}</span>`;

      row.innerHTML = `
        <td><strong>${o.customerId.name}</strong></td>
        <td>${o.products[0].productId.name}</td>
        <td>${o.products[0].quantity}</td>
        <td><strong>$${(o.totalPrice || o.totalAmount || 0).toFixed(
        2
      )}</strong></td>
        <td>${statusBadge}</td>
        <td>${new Date(o.date).toLocaleDateString()}</td>
        <td class="action-buttons">
          <button class="btn-small btn-invoice" onclick='generateInvoice(${JSON.stringify(
        o
      ).replace(/'/g, "\\'")})'>📄 Invoice</button>
          ${o.status === "paid" || o.status === "processing"
          ? `<button class="btn-small btn-edit" onclick="createShippingForOrder('${o._id}')">🚚 Ship</button>`
          : ""
        }
          <button class="btn-small btn-delete" onclick="deleteOrder('${o._id
        }')">Delete</button>
        </td>
      `;
      orderTableBody.appendChild(row);

      // Update shipping order select
      const shippingOrderSelect = document.getElementById("shippingOrder");
      if (
        shippingOrderSelect &&
        (o.status === "paid" || o.status === "processing")
      ) {
        shippingOrderSelect.innerHTML += `<option value="${o._id
          }">Order #${o._id.slice(-6)} - ${o.customerId?.name}</option>`;
      }
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
  const invoiceWindow = window.open("", "_blank", "width=800,height=900");
  const invoiceDate = new Date(order.date || Date.now());
  const invoiceNumber = `INV-${order._id.toString().slice(-8).toUpperCase()}`;

  invoiceWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice ${invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            padding: 40px;
            color: #333;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 50px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            border-radius: 8px;
          }
          .invoice-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #1abc9c;
          }
          .company-info h1 {
            color: #2c3e50;
            font-size: 32px;
            margin-bottom: 10px;
          }
          .invoice-meta {
            text-align: right;
            color: #7f8c8d;
          }
          .invoice-meta h2 {
            color: #1abc9c;
            font-size: 24px;
            margin-bottom: 10px;
          }
          .invoice-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 30px 0;
          }
          .detail-section h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 18px;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 5px;
          }
          .detail-section p {
            margin: 8px 0;
            color: #555;
          }
          .items-table {
            width: 100%;
            margin: 30px 0;
            border-collapse: collapse;
          }
          .items-table th {
            background: #34495e;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
          }
          .items-table td {
            padding: 15px;
            border-bottom: 1px solid #ecf0f1;
          }
          .items-table tr:hover {
            background: #f8f9fa;
          }
          .text-right { text-align: right; }
          .total-section {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #1abc9c;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            font-size: 16px;
          }
          .total-row.final {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-top: 10px;
            padding-top: 15px;
            border-top: 2px solid #ecf0f1;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
            text-align: center;
            color: #7f8c8d;
            font-size: 14px;
          }
          .print-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1abc9c;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: all 0.3s;
          }
          .print-btn:hover {
            background: #16a085;
            transform: translateY(-2px);
            box-shadow: 0 6px 8px rgba(0,0,0,0.15);
          }
          @media print {
            body { background: white; padding: 0; }
            .print-btn { display: none; }
            .invoice-container { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">🖨️ Print Invoice</button>
        <div class="invoice-container">
          <div class="invoice-header">
            <div class="company-info">
              <h1>Wholesale Management Co.</h1>
              <p style="color: #7f8c8d;">123 Business Street<br>City, State 12345<br>Phone: (555) 123-4567</p>
            </div>
            <div class="invoice-meta">
              <h2>INVOICE</h2>
              <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
              <p><strong>Date:</strong> ${invoiceDate.toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  )}</p>
              <p><strong>Order ID:</strong> ${order._id}</p>
            </div>
          </div>
          
          <div class="invoice-details">
            <div class="detail-section">
              <h3>Bill To:</h3>
              <p><strong>${order.customerName || "Customer"}</strong></p>
              <p>${order.customerEmail || ""}</p>
              <p>${order.customerPhone || ""}</p>
              <p>${order.customerAddress || ""}</p>
            </div>
            <div class="detail-section">
              <h3>Order Details:</h3>
              <p><strong>Status:</strong> <span style="color: ${order.status === "paid"
      ? "#27ae60"
      : order.status === "delivered"
        ? "#3498db"
        : "#f39c12"
    }">${(order.status || "pending").toUpperCase()}</span></p>
              <p><strong>Order Date:</strong> ${invoiceDate.toLocaleDateString()}</p>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Description</th>
                <th class="text-right">Quantity</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${Array.isArray(order.products)
      ? order.products
        .map(
          (p) => `
                <tr>
                  <td>${p.name || "Product"}</td>
                  <td>${p.name || "Product Item"}</td>
                  <td class="text-right">${p.quantity || order.quantity || 1
            }</td>
                  <td class="text-right">$${(p.price || 0).toFixed(2)}</td>
                  <td class="text-right">$${(
              (p.price || 0) * (p.quantity || order.quantity || 1)
            ).toFixed(2)}</td>
                </tr>
              `
        )
        .join("")
      : `
                <tr>
                  <td>${order.productName || "Product"}</td>
                  <td>${order.productName || "Product Item"}</td>
                  <td class="text-right">${order.quantity || 1}</td>
                  <td class="text-right">$${(
        (order.totalPrice || order.totalAmount || 0) /
        (order.quantity || 1)
      ).toFixed(2)}</td>
                  <td class="text-right">$${(
        order.totalPrice ||
        order.totalAmount ||
        0
      ).toFixed(2)}</td>
                </tr>
              `
    }
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>$${(order.totalPrice || order.totalAmount || 0).toFixed(
      2
    )}</span>
            </div>
            <div class="total-row">
              <span>Tax (0%):</span>
              <span>$0.00</span>
            </div>
            <div class="total-row">
              <span>Shipping:</span>
              <span>$0.00</span>
            </div>
            <div class="total-row final">
              <span>Total Amount:</span>
              <span>$${(order.totalPrice || order.totalAmount || 0).toFixed(
      2
    )}</span>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Thank you for your business!</strong></p>
            <p>Payment terms: Net 30 days | Questions? Contact us at support@wholesale.com</p>
            <p style="margin-top: 10px; font-size: 12px;">This is a computer-generated invoice. No signature required.</p>
          </div>
        </div>
      </body>
    </html>
  `);
  invoiceWindow.document.close();
}

// ===== INVENTORY MANAGEMENT =====
async function loadLowStock() {
  try {
    const res = await fetch("/api/products/?threshold=10");
    const products = await res.json();
    const inventoryDiv = document.getElementById("inventoryReport");
    if (products.length === 0) {
      inventoryDiv.innerHTML = "<p>✅ All products are well stocked!</p>";
      return;
    }

    let html =
      "<h3>⚠️ Low Stock Alert</h3><table border='1'><thead><tr><th>Product</th><th>Current Stock</th><th>Price</th></tr></thead><tbody>";
    products.forEach((p) => {
      html += `<tr style="background: ${p.quantity === 0 ? "#ffebee" : "#fff3e0"
        }">
        <td>${p.name}</td>
        <td><strong>${p.quantity}</strong></td>
        <td>$${p.price}</td>
      </tr>`;
    });
    html += "</tbody></table>";
    inventoryDiv.innerHTML = html;
  } catch (error) {
    console.error("Error loading low stock:", error);
    document.getElementById("inventoryReport").innerHTML =
      "⚠️ Failed to load low stock items.";
  }
}

async function loadInventoryReport() {
  try {
    const res = await fetch("/api/products/?inventory=true");
    const report = await res.json();
    console.log(report, "90000000000000000000000000000000000000000000")
    const inventoryDiv = document.getElementById("inventoryReport");
    let html = `
      <h3>📊 Inventory Report</h3>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px;">
        <div style="padding: 15px; background: #e3f2fd; border-radius: 8px;">
          <strong>Total Products</strong><br>${report.products.length + 1}
        </div>
        <div style="padding: 15px; background: #e8f5e9; border-radius: 8px;">
          <strong>Total Value</strong><br>$${report.products.length + 1}
        </div>
        <div style="padding: 15px; background: #fff3e0; border-radius: 8px;">
          <strong>Low Stock</strong><br>${report.lowStockCount}
        </div>
        <div style="padding: 15px; background: #ffebee; border-radius: 8px;">
          <strong>Out of Stock</strong><br>${report.outOfStockCount}
        </div>
      </div>
      <table border="1" style="width: 100%;">
        <thead>
          <tr>
            <th>Product</th><th>Quantity</th><th>Price</th><th>Total Value</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
    `;



    report.products.forEach((p) => {
      console.log(p);
      const getStatus = (qty) => {
        if (qty <= 0) return "out_of_stock";
        if (qty <= 10) return "low_stock";
        return "in_stock";
      };

      const statusColor =
        getStatus(p.quantity) === "out_of_stock"
          ? "#f44336"
          : getStatus(p.quantity) === "low_stock"
            ? "#ff9800"
            : "#4caf50";

      html += `<tr>
        <td>${p.name}</td>
        <td>${p.quantity}</td>
        <td>$${p.price}</td>
        <td>$${report.products.length + 1}</td>
        <td><span style="color: ${statusColor}; font-weight: bold;">${getStatus(p.quantity)
          .replace("_", " ")
          .toUpperCase()}</span></td>
      </tr>`;
    });

    html += "</tbody></table>";
    inventoryDiv.innerHTML = html;
  } catch (error) {
    console.error("Error loading inventory report:", error);
    document.getElementById("inventoryReport").innerHTML =
      "⚠️ Failed to load inventory report.";
  }
}

// ===== REPORTS =====
async function loadReports() {
  try {
    const res = await fetch("/api/reports/sales");
    const report = await res.json();

    document.getElementById("salesReport").innerHTML = `
      <h3>Sales Report</h3>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
        <div style="padding: 15px; background: #e3f2fd; border-radius: 8px;">
          <strong>Total Sales</strong><br>$${report.totalSales || 0}
        </div>
        <div style="padding: 15px; background: #e8f5e9; border-radius: 8px;">
          <strong>Total Orders</strong><br>${report.totalOrders || 0}
        </div>
        <div style="padding: 15px; background: #fff3e0; border-radius: 8px;">
          <strong>Best Product</strong><br>${report.bestProduct || "N/A"}
        </div>
        <div style="padding: 15px; background: #f3e5f5; border-radius: 8px;">
          <strong>Top Customer</strong><br>${report.topCustomer || "N/A"}
        </div>
      </div>
    `;
  } catch (error) {
    console.error(error);
    document.getElementById("salesReport").innerHTML =
      "⚠️ Failed to load report.";
  }
}

// ===== SHIPPING MANAGEMENT =====
async function loadShippings() {
  try {
    const res = await fetch("/api/shipping");
    const shippings = await res.json();
    const shippingTableBody = document.querySelector("#shippingTable tbody");

    if (!shippingTableBody) return;

    shippingTableBody.innerHTML = "";

    if (shippings.length === 0) {
      shippingTableBody.innerHTML = `<tr><td colspan="6">No shipments found</td></tr>`;
      return;
    }

    shippings.forEach((s) => {
      const row = document.createElement("tr");
      const statusClass = `status-${(s.status || "pending")
        .toLowerCase()
        .replace("_", "-")}`;
      const statusBadge = `<span class="status-badge ${statusClass}">${(
        s.status || "pending"
      )
        .replace("_", " ")
        .toUpperCase()}</span>`;

      row.innerHTML = `
        <td><strong>${s.trackingNumber}</strong></td>
        <td>${s.orderId?._id ? s.orderId._id.slice(-8) : "N/A"}</td>
        <td>${statusBadge}</td>
        <td>${s.currentLocation || "Warehouse"}</td>
        <td>${s.estimatedDelivery
          ? new Date(s.estimatedDelivery).toLocaleDateString()
          : "N/A"
        }</td>
        <td class="action-buttons">
          <button class="btn-small btn-edit" onclick="trackShipping('${s.trackingNumber
        }')">Track</button>
          <button class="btn-small btn-edit" onclick="updateShippingStatus('${s._id
        }')">Update</button>
        </td>
      `;
      shippingTableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading shippings:", error);
  }
}

async function createShipping() {
  const orderId = document.getElementById("shippingOrder").value;
  const shippingAddress = document.getElementById("shippingAddress").value;
  const estimatedDelivery = document.getElementById("estimatedDelivery").value;

  if (!orderId || !shippingAddress) {
    alert("Please select an order and enter shipping address");
    return;
  }

  try {
    const res = await fetch("/api/shipping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        shippingAddress,
        estimatedDelivery: estimatedDelivery || undefined,
      }),
    });

    if (res.ok) {
      alert("Shipping created successfully!");
      loadShippings();
      loadOrders();
      document.getElementById("shippingOrder").value = "";
      document.getElementById("shippingAddress").value = "";
      document.getElementById("estimatedDelivery").value = "";
    } else {
      const data = await res.json();
      alert("Error: " + (data.message || "Failed to create shipping"));
    }
  } catch (error) {
    console.error("Error creating shipping:", error);
    alert("Failed to create shipping");
  }
}

function createShippingForOrder(orderId) {
  document.getElementById("shippingOrder").value = orderId;
  document.getElementById("shippingAddress").focus();
}

function trackShipping(trackingNumber) {
  window.open(`/api/shipping/tracking/${trackingNumber}`, "_blank");
}

async function updateShippingStatus(shippingId) {
  const status = prompt(
    "Enter new status (pending, in_transit, out_for_delivery, delivered, exception):"
  );
  const location = prompt("Enter current location:");

  if (!status) return;

  try {
    const res = await fetch(`/api/shipping/${shippingId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, location }),
    });

    if (res.ok) {
      alert("Shipping status updated!");
      loadShippings();
      loadOrders();
    }
  } catch (error) {
    console.error("Error updating shipping:", error);
  }
}

// ===== CUSTOMER HISTORY =====
async function viewCustomerHistory(customerId) {
  try {
    const res = await fetch(`/api/customers/${customerId}/history`);
    const data = await res.json();

    const modal = document.getElementById("customerHistoryModal");
    const content = document.getElementById("customerHistoryContent");

    content.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h3>${data.customer.name}</h3>
        <p><strong>Email:</strong> ${data.customer.email}</p>
        <p><strong>Phone:</strong> ${data.customer.phone || "N/A"}</p>
        <p><strong>Address:</strong> ${data.customer.address || "N/A"}</p>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;">
        <div style="padding: 15px; background: #e3f2fd; border-radius: 8px;">
          <strong>Total Orders</strong><br>${data.statistics.totalOrders}
        </div>
        <div style="padding: 15px; background: #e8f5e9; border-radius: 8px;">
          <strong>Total Spent</strong><br>$${data.statistics.totalSpent.toFixed(
      2
    )}
        </div>
        <div style="padding: 15px; background: #fff3e0; border-radius: 8px;">
          <strong>Avg Order</strong><br>$${data.statistics.averageOrderValue.toFixed(
      2
    )}
        </div>
        <div style="padding: 15px; background: #fce4ec; border-radius: 8px;">
          <strong>Pending</strong><br>${data.statistics.pendingOrders}
        </div>
      </div>
      
      <h4>Order History</h4>
      <table style="width: 100%; margin-bottom: 30px;">
        <thead>
          <tr style="background: #667eea; color: white;">
            <th>Date</th>
            <th>Products</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${data.orders
        .map(
          (o) => `
            <tr>
              <td>${new Date(o.date).toLocaleDateString()}</td>
              <td>${o.products
              .map((p) => `${p.productId?.name || "Product"} (${p.quantity})`)
              .join(", ")}</td>
              <td>$${o.totalAmount.toFixed(2)}</td>
              <td><span class="status-badge status-${o.status
            }">${o.status.toUpperCase()}</span></td>
            </tr>
          `
        )
        .join("")}
        </tbody>
      </table>
      
      <h4>Payment History</h4>
      <table style="width: 100%;">
        <thead>
          <tr style="background: #667eea; color: white;">
            <th>Date</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${data.payments
        .map(
          (p) => `
            <tr>
              <td>${new Date(p.paymentDate).toLocaleDateString()}</td>
              <td>$${p.amount.toFixed(2)}</td>
              <td>${p.method.toUpperCase()}</td>
              <td><span class="status-badge status-${p.status
            }">${p.status.toUpperCase()}</span></td>
            </tr>
          `
        )
        .join("")}
        </tbody>
      </table>
    `;

    modal.style.display = "block";
  } catch (error) {
    console.error("Error loading customer history:", error);
    alert("Failed to load customer history");
  }
}

function closeCustomerHistory() {
  document.getElementById("customerHistoryModal").style.display = "none";
}

window.onclick = function (event) {
  const modal = document.getElementById("customerHistoryModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// ===== INIT =====
window.onload = () => {
  loadProducts();
  loadCustomers();
  loadOrders();
  loadReports();
  loadShippings();
};
