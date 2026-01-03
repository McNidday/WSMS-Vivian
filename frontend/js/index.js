async function loadStats() {
    try {
        const productRes = await fetch('/api/products');
        const products = await productRes.json();

        const customerRes = await fetch('/api/customers');
        const customers = await customerRes.json();

        document.getElementById('productCount').textContent = products.length;
        document.getElementById('customerCount').textContent = customers.length;
    } catch (err) {
        console.error('Error loading stats:', err);
    }
}

window.onload = loadStats;
