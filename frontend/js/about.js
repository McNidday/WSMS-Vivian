const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const aboutTitle = document.getElementById('aboutTitle');
const aboutDescription = document.getElementById('aboutDescription');
const aboutForm = document.getElementById('aboutForm');

async function loadAbout() {
    const res = await fetch('/api/about');
    const data = await res.json();

    if (data) {
        aboutTitle.textContent = data.title || '';
        aboutDescription.textContent = data.description || '';
        titleInput.value = data.title || '';
        descriptionInput.value = data.description || '';
    }
}

aboutForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = titleInput.value;
    const description = descriptionInput.value;

    const res = await fetch('/api/about', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
    });

    if (res.ok) {
        loadAbout();
    }
});

window.onload = loadAbout;
