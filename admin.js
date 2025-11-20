// =======================================================
// PROTECCIÓN DE ACCESO
// =======================================================
auth.onAuthStateChanged(user => {
  if (!user) location.href = "admin-login.html";
});

function logout() {
  auth.signOut();
}

// =======================================================
// VARIABLES GLOBALES
// =======================================================
let editId = null;
let prevSize = null;

const appsList = document.getElementById("appsList");
const appsListWrap = document.getElementById("appsListWrap");
const loadingMoreEl = document.getElementById("loadingMore");
const noMoreEl = document.getElementById("noMore");
const searchInput = document.getElementById("searchInput");

// Paging
const PAGE_SIZE = 10;
let lastVisible = null;
let loading = false;
let exhausted = false;
let inSearchMode = false;

// Cache local (items cargados)
let loadedAppsCache = [];

// =======================================================
// CARGA INICIAL: primeros PAGE_SIZE items
// =======================================================
function resetPagination() {
  lastVisible = null;
  exhausted = false;
  loadedAppsCache = [];
  appsList.innerHTML = "";
}

function loadInitialApps() {
  resetPagination();
  inSearchMode = false;
  loadMoreApps();
}

function loadMoreApps() {
  if (loading || exhausted || inSearchMode) return;
  loading = true;
  loadingMoreEl.classList.remove("hidden");

  let query = db.collection("apps").orderBy("fecha", "desc").limit(PAGE_SIZE);

  if (lastVisible) {
    query = db.collection("apps").orderBy("fecha", "desc").startAfter(lastVisible).limit(PAGE_SIZE);
  }

  query.get()
    .then(snap => {
      if (snap.empty) {
        exhausted = true;
        noMoreEl.classList.remove("hidden");
        loadingMoreEl.classList.add("hidden");
        loading = false;
        return;
      }

      const docs = snap.docs;
      lastVisible = docs[docs.length - 1];

      const items = docs.map(d => d.data());
      loadedAppsCache = loadedAppsCache.concat(items);

      renderApps(items, true);

      // si menos de PAGE_SIZE, se acabó
      if (items.length < PAGE_SIZE) {
        exhausted = true;
        noMoreEl.classList.remove("hidden");
      }

      loadingMoreEl.classList.add("hidden");
      loading = false;
    })
    .catch(err => {
      console.error("Error cargando apps:", err);
      loadingMoreEl.classList.add("hidden");
      loading = false;
    });
}

// =======================================================
// RENDERIZADO DE FILAS
// append = true para añadir al final
// =======================================================
function renderApps(items, append = false) {
  let html = items.map(a => {
    return `
      <tr id="app-row-${a.id}">
        <td><img src="${a.icono || a.imagen || ''}" class="table-icon" alt="icono"></td>
        <td>${escapeHtml(a.nombre || '')}</td>
        <td>${escapeHtml(a.categoria || '')}</td>
        <td>${escapeHtml(a.version || '')}</td>
        <td>
          <button class="btn-edit" onclick="cargarParaEditar('${a.id}')">✏️ Editar</button>
          <button class="btn-delete" onclick="eliminarApp('${a.id}')">🗑 Eliminar</button>
        </td>
      </tr>
    `;
  }).join("");

  if (append) {
    appsList.insertAdjacentHTML('beforeend', html);
  } else {
    appsList.innerHTML = html;
  }
}

// Pequeña función de escape para evitar inyección
function escapeHtml(str) {
  return (str + '').replace(/[&<>"'`=\/]/g, function(s) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    })[s];
  });
}

// =======================================================
// BÚSQUEDA POR NOMBRE (usa consulta por prefijo en Firestore)
// Si hay texto, entramos en modo búsqueda y mostramos resultados.
// Si el campo queda vacío, volvemos a paginación normal.
// =======================================================
let searchTimer = null;
searchInput.addEventListener('input', e => {
  const term = e.target.value.trim();
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    if (!term) {
      // volver a paginación normal
      inSearchMode = false;
      noMoreEl.classList.add("hidden");
      loadInitialApps();
      return;
    }
    performSearch(term);
  }, 350);
});

function performSearch(term) {
  inSearchMode = true;
  loadingMoreEl.classList.remove("hidden");
  noMoreEl.classList.add("hidden");
  appsList.innerHTML = "";

  const start = term;
  const end = term + '\uf8ff';

  // Usamos orderBy "nombre" y startAt/endAt para un prefijo simple (necesita index si lo requiere)
  db.collection("apps").orderBy("nombre").startAt(start).endAt(end).limit(100).get()
    .then(snap => {
      if (snap.empty) {
        appsList.innerHTML = '<tr><td colspan="5" style="padding:12px;color:#94a3b8">No se encontraron aplicaciones</td></tr>';
        loadingMoreEl.classList.add("hidden");
        return;
      }
      const items = snap.docs.map(d => d.data());
      // opcional: ordenar por fecha descendente localmente si lo deseas
      items.sort((a,b) => (b.fecha || 0) - (a.fecha || 0));
      renderApps(items, false);
      loadingMoreEl.classList.add("hidden");
    })
    .catch(err => {
      console.error("Error en búsqueda:", err);
      loadingMoreEl.classList.add("hidden");
    });
}

// =======================================================
// SCROLL INFINITO: cuando el contenedor de apps se acerque al final, cargar más
// =======================================================
appsListWrap.addEventListener('scroll', () => {
  if (inSearchMode) return; // no paginar durante búsqueda
  const { scrollTop, scrollHeight, clientHeight } = appsListWrap;
  if (scrollTop + clientHeight >= scrollHeight - 160) {
    loadMoreApps();
  }
});

// =======================================================
// CARGAR APP PARA EDITAR
// =======================================================
function cargarParaEditar(id) {
  editId = id;

  document.getElementById("formTitle").textContent = "✏️ Editar Aplicación";
  document.getElementById("subirBtn").textContent = "GUARDAR";

  db.collection("apps").doc(id).get().then(doc => {
    const a = doc.data();

    // Campos principales
    document.getElementById("nombre").value = a.nombre || '';
    document.getElementById("descripcion").value = a.descripcion || '';
    document.getElementById("version").value = a.version || '';
    document.getElementById("categoria").value = a.categoria || '';
    document.getElementById("idioma").value = a.idioma || '';
    document.getElementById("tipo").value = a.tipo || '';
    document.getElementById("internet").value = a.internet || 'offline';

    // Extras
    document.getElementById("sistema").value = a.sistemaOperativo || "";
    document.getElementById("requisitos").value = a.requisitos || "";
    document.getElementById("fechaAct").value = a.fechaActualizacion || "";
    document.getElementById("edad").value = a.edad || "";
    document.getElementById("anuncios").value = a.anuncios || "no";
    document.getElementById("privacidad").value = a.privacidadUrl || "";

    // URLs
    document.getElementById("imagenUrl").value = a.imagen || "";
    document.getElementById("capturasUrl").value = a.imgSecundarias ? a.imgSecundarias.join(",") : "";
    document.getElementById("iconoUrl").value = a.icono || "";
    document.getElementById("apkUrl").value = a.apk || "";

    document.getElementById("size").value = a.size || "";
    prevSize = a.size || null;

    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// =======================================================
// ELIMINAR APP
// =======================================================
function eliminarApp(id) {
  if (!confirm("¿Eliminar esta aplicación?")) return;

  db.collection("apps").doc(id).delete()
  .then(() => {
    alert("Aplicación eliminada ✔");
    // eliminar de la UI
    const row = document.getElementById(`app-row-${id}`);
    if (row) row.remove();
    // actualizar cache local
    loadedAppsCache = loadedAppsCache.filter(a => a.id !== id);
  })
  .catch(err => alert("Error: " + err.message));
}

// =======================================================
// GUARDAR / EDITAR APP
// (se mantiene la lógica que tenías, con subida de archivos)
// =======================================================
async function guardarApp() {

  const btn = document.getElementById("subirBtn");
  const estado = document.getElementById("estado");

  // Desactivar botón
  btn.disabled = true;
  estado.textContent = "Guardando...";

  // Capturar campos
  const campos = {
    nombre: nombre.value.trim(),
    descripcion: descripcion.value.trim(),
    version: version.value.trim(),
    categoria: categoria.value.trim(),
    idioma: idioma.value.trim(),
    tipo: tipo.value.trim(),
    internet: internet.value,
    sistemaOperativo: sistema.value.trim(),
    requisitos: requisitos.value.trim(),
    fechaActualizacion: fechaAct.value,
    edad: edad.value.trim(),
    anuncios: anuncios.value,
    privacidadUrl: privacidad.value.trim(),
    imagen: imagenUrl.value.trim(),
    apk: apkUrl.value.trim(),
    size: size.value.trim() || "N/A",
    imgSecundarias: capturasUrl.value.split(",").map(u => u.trim()).filter(u => u !== "")
  };

  // Validación mínima
  if (!campos.nombre || !campos.descripcion || !campos.version) {
    alert("Completa al menos nombre, descripción y versión.");
    btn.disabled = false;
    estado.textContent = "";
    return;
  }

  // Archivos nuevos
  const imagenFile = imagen.files[0];
  const apkFile = apk.files[0];
  const capturasFiles = capturas.files;

  const storageRef = firebase.storage().ref();

  // Promesas
  let promesas = [];

  // Imagen principal
  if (imagenFile) {
    promesas.push(
      storageRef.child("images/" + imagenFile.name)
        .put(imagenFile)
        .then(r => r.ref.getDownloadURL())
        .then(url => campos.imagen = url)
    );
  }

  // APK
  if (apkFile) {
    promesas.push(
      storageRef.child("apk/" + apkFile.name)
        .put(apkFile)
        .then(r => r.ref.getDownloadURL())
        .then(url => campos.apk = url)
    );
  }

  // Capturas
  if (capturasFiles.length > 0) {
    campos.imgSecundarias = [];
    promesas.push(
      Promise.all(
        [...capturasFiles].map(file =>
          storageRef.child("capturas/" + file.name)
          .put(file)
          .then(r => r.ref.getDownloadURL())
          .then(url => campos.imgSecundarias.push(url))
        )
      )
    );
  }

  // Esperar todas las subidas
  await Promise.all(promesas);

  // Crear o editar ID
  let id = editId || db.collection("apps").doc().id;

  const data = {
    id,
    ...campos,
    fecha: Date.now()
  };

  // Guardar
  db.collection("apps").doc(id).set(data, { merge: true })
    .then(() => {
      estado.textContent = "Guardado ✔";
      btn.disabled = false;
      editId = null;

      document.getElementById("formTitle").textContent = "➕ Nueva Aplicación";
      btn.textContent = "SUBIR APP";

      limpiarFormulario();

      // actualizar UI: si no estamos en búsqueda, recargar inicial para ver cambios
      if (!inSearchMode) {
        loadInitialApps();
      } else {
        // si estamos en búsqueda, refrescar la búsqueda actual
        const currentSearch = searchInput.value.trim();
        if (currentSearch) performSearch(currentSearch);
      }
    })
    .catch(err => {
      estado.textContent = "Error: " + err.message;
      btn.disabled = false;
    });
}

// =======================================================
// LIMPIAR FORMULARIO
// =======================================================
function limpiarFormulario() {
  const inputs = document.querySelectorAll("input, textarea, select");
  inputs.forEach(i => i.value = "");

  categoria.value = "Educación";
  tipo.value = "Gratis";
  internet.value = "offline";
  anuncios.value = "no";

  // reset archivos
  const imagenEl = document.getElementById("imagen");
  const apkEl = document.getElementById("apk");
  const capturasEl = document.getElementById("capturas");
  if (imagenEl) imagenEl.value = "";
  if (apkEl) apkEl.value = "";
  if (capturasEl) capturasEl.value = "";

  prevSize = null;
}

// =======================================================
// Inicializar carga al abrir la página
// =======================================================
document.addEventListener('DOMContentLoaded', () => {
  loadInitialApps();
});

// Función para actualizar el nombre del archivo en los botones de selección
function updateFileName(inputId, labelId) {
  const input = document.getElementById(inputId);
  const label = document.getElementById(labelId);
  
  input.addEventListener('change', function() {
    const fileName = input.files[0] ? input.files[0].name : 'Seleccionar';
    label.textContent = fileName; // Cambia el texto del botón
  });
}

// Llamar a la función para cada uno de los campos de archivo
document.addEventListener('DOMContentLoaded', () => {
  updateFileName('imagen', 'imagenLabel');
  updateFileName('apk', 'apkLabel');
  updateFileName('capturas', 'capturasLabel');
});
