// index.js — lógica de la tienda pública

const appsGrid = document.getElementById('appsGrid');
const searchInput = document.getElementById('searchInput');
const emptyState = document.getElementById('emptyState');
const categoryChips = document.querySelectorAll('.chip');

document.getElementById('year').textContent = new Date().getFullYear();

let apps = [];        // todas las apps de Firestore
let currentCat = 'all';
let searchText = '';

// Escuchar cambios en Firestore (colección "apps")
db.collection('apps')
  .orderBy('fecha', 'desc')
  .onSnapshot(snapshot => {
    apps = snapshot.docs.map(doc => doc.data());
    renderApps();
  }, err => {
    console.error('Error obteniendo apps:', err);
    emptyState.style.display = 'block';
    emptyState.textContent = 'Error cargando apps. Intenta más tarde.';
  });

// Renderizar la grilla de apps
function renderApps() {
  appsGrid.innerHTML = '';

  const q = searchText.toLowerCase();

  const filtered = apps.filter(app => {
    if (!app) return false;

    // filtro por categoría
    if (currentCat !== 'all' && (app.categoria || '') !== currentCat) return false;

    // filtro por texto
    if (!q) return true;

    const nombre = (app.nombre || '').toLowerCase();
    const desc = (app.descripcion || '').toLowerCase();
    return nombre.includes(q) || desc.includes(q);
  });

  if (!filtered.length) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  filtered.forEach(app => {
    const card = document.createElement('article');
    card.className = 'app-card';

    const img = document.createElement('img');
    img.className = 'app-thumb';
    img.src = app.imagen || 'logo appsmart.png';
    img.alt = app.nombre || 'App';

    const body = document.createElement('div');
    body.className = 'app-body';

    const titleRow = document.createElement('div');
    titleRow.className = 'app-title-row';

    const title = document.createElement('h3');
    title.className = 'app-title';
    title.textContent = app.nombre || 'App sin nombre';

    const typeBadge = document.createElement('span');
    typeBadge.className = 'badge';
    typeBadge.textContent = app.tipo || 'Gratis';

    titleRow.appendChild(title);
    titleRow.appendChild(typeBadge);

    const meta = document.createElement('div');
    meta.className = 'app-meta';
    meta.textContent = `${app.categoria || 'Sin categoría'} • v${app.version || '1.0'} • ${app.idioma || 'ES'}`;

    const desc = document.createElement('p');
    desc.className = 'app-desc';
    desc.textContent = app.descripcion || '';

    const footer = document.createElement('div');
    footer.className = 'card-footer';

    const stats = document.createElement('div');
    stats.className = 'stats';
    const likesSpan = document.createElement('span');
    likesSpan.innerHTML = `👍 <strong>${app.likes || 0}</strong>`;
    const dlsSpan = document.createElement('span');
    dlsSpan.innerHTML = `⬇️ <strong>${app.descargas || 0}</strong>`;
    stats.appendChild(likesSpan);
    stats.appendChild(dlsSpan);

    const btnRow = document.createElement('div');
    btnRow.className = 'btn-row';

    if (app.apk) {
      const btnApk = document.createElement('a');
      btnApk.href = app.apk;
      btnApk.target = '_blank';
      btnApk.rel = 'noreferrer';
      btnApk.className = 'btn-small btn-primary';
      btnApk.textContent = 'Instalar APK';
      btnRow.appendChild(btnApk);
    }

    if (app.playUrl) {
      const btnPlay = document.createElement('a');
      btnPlay.href = app.playUrl;
      btnPlay.target = '_blank';
      btnPlay.rel = 'noreferrer';
      btnPlay.className = 'btn-small btn-ghost';
      btnPlay.textContent = 'Google Play';
      btnRow.appendChild(btnPlay);
    }

    footer.appendChild(stats);
    footer.appendChild(btnRow);

    body.appendChild(titleRow);
    body.appendChild(meta);
    body.appendChild(desc);
    body.appendChild(footer);

    card.appendChild(img);
    card.appendChild(body);

    appsGrid.appendChild(card);
  });
}

// Eventos de búsqueda y categorías
searchInput.addEventListener('input', (e) => {
  searchText = e.target.value.trim();
  renderApps();
});

categoryChips.forEach(chip => {
  chip.addEventListener('click', () => {
    categoryChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentCat = chip.getAttribute('data-cat');
    renderApps();
  });
});
