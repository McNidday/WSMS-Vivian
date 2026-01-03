const serviceForm = document.getElementById('serviceForm');
const serviceTableBody = document.querySelector('#serviceTable tbody');

serviceForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('serviceName').value;
    const description = document.getElementById('serviceDescription').value;
    const price = parseFloat(document.getElementById('servicePrice').value);

    const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, price })
    });

    if (res.ok) {
        serviceForm.reset();
        loadServices();
    }
});

async function loadServices() {
    const res = await fetch('/api/services');
    const services = await res.json();

    serviceTableBody.innerHTML = '';
    services.forEach(s => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${s.name}</td>
            <td>${s.description || ''}</td>
            <td>${s.price || 0}</td>
            <td><button onclick="deleteService('${s._id}')">Delete</button></td>
        `;
        serviceTableBody.appendChild(row);
    });
}

async function deleteService(id) {
    await fetch(`/api/services/${id}`, { method: 'DELETE' });
    loadServices();
}

window.onload = loadServices;
