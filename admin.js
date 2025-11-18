<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Panel Administrador</title>
  <link rel="stylesheet" href="admin.css">
  <style>
    #modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5); /* Fondo semi-transparente */
        display: flex;
        justify-content: center;
        align-items: center;
    }
    #modalContent {
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
    }
    #modal img {
        cursor: pointer;
        margin: 10px;
        height: 100px;
        border-radius: 5px;
    }
  </style>
</head>

<body>

<div class="admin-container">

  <header class="admin-header">
    <div class="admin-header-left">
      <h1><span class="icon">⚙️</span> AppsMart Admin</h1>
      <p>Subir, editar y manejar aplicaciones</p>
    </div>
    <button class="btn-logout" onclick="logout()">Cerrar sesión</button>
  </header>

  <!-- ============ BOTÓN PARA MOSTRAR / OCULTAR ============ -->
  <button id="toggleBtn" class="btn-toggle" onclick="toggleApps()">📦 Apps Subidas</button>

  <!-- ============ LISTADO OCULTO AL INICIO ============ -->
  <div id="appsContainer" class="hidden">
    <h3 class="panel-section-title">📦 Aplicaciones Publicadas</h3>

    <table class="apps-table">
      <thead>
        <tr>
          <th>Icono</th>
          <th>Nombre</th>
          <th>Categoría</th>
          <th>Versión</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody id="appsList"></tbody>
    </table>
  </div>

  <!-- ============ FORMULARIO ============ -->
  <h3 class="panel-section-title" id="formTitle">➕ Nueva Aplicación</h3>

  <div class="form-card">

    <!-- Columna 1 -->
    <div class="form-main-fields">
      <div class="form-group">
        <label>Nombre</label>
        <input id="nombre" type="text">
      </div>

      <div class="form-group">
        <label>Descripción</label>
        <textarea id="descripcion"></textarea>
      </div>

      <div class="form-group">
        <label>Versión</label>
        <input id="version" type="text">
      </div>

      <div class="form-group">
        <label>Sistema Operativo</label>
        <input id="sistema" type="text" placeholder="Ej: Android">
      </div>

      <div class="form-group">
        <label>Requisitos del sistema</label>
        <input id="requisitos" type="text" placeholder="Ej: Android 5.0+">
      </div>

      <div class="form-group">
        <label>Fecha de actualización</label>
        <input id="fechaAct" type="date">
      </div>

      <div class="form-group">
        <label>Edad recomendada</label>
        <input id="edad" type="text" placeholder="Ej: +13, +16">
      </div>

      <div class="form-group">
        <label>Categoría</label>
        <select id="categoria">
          <option>Educación</option>
          <option>Libros</option>
          <option>Juegos</option>
          <option>Sociales</option>
          <option>Herramientas</option>
          <option>Entretenimiento</option>
          <option>Música y Audio</option>
          <option>Fotografía y Video</option>
          <option>Productividad</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Idioma</label>
        <input id="idioma" type="text">
      </div>

      <div class="form-group">
        <label>Tipo</label>
        <select id="tipo">
          <option>Gratis</option>
          <option>Pagada</option>
        </select>
      </div>

        <div class="form-group">
        <label>Conexión</label>
        <select id="internet">
          <option value="offline">Funciona sin Internet</option>
          <option value="online">Requiere Internet</option>
        </select>
      </div>
    </div>
    

    <!-- Columna 2 -->
    <div class="form-side-fields">

      <div class="form-group">
        <label>¿Contiene anuncios?</label>
        <select id="anuncios">
          <option value="si">Sí contiene</option>
          <option value="no">No contiene</option>
        </select>
      </div>

      <div class="form-group">
        <label>Política de privacidad (URL)</label>
        <input id="privacidad" type="text" placeholder="https://...">
      </div>

      <!-- ======================= -->
      <!--   NUEVOS CAMPOS URL     -->
      <!-- ======================= -->

      <div class="form-group">
        <label>URL Imagen Principal (GitHub RAW u otra)</label>
        <input id="imagenUrl" type="text" placeholder="https://...">
      </div>

      <!-- ======================= -->
      <!--   NUEVOS CAMPOS PARA LAS CAPTURAS (6 URLs) -->
      <!-- ======================= -->

      <div class="form-group">
        <label>URL de Captura 1</label>
        <input id="capturaUrl1" type="text" placeholder="https://...">
      </div>

      <div class="form-group">
        <label>URL de Captura 2</label>
        <input id="capturaUrl2" type="text" placeholder="https://...">
      </div>

      <div class="form-group">
        <label>URL de Captura 3</label>
        <input id="capturaUrl3" type="text" placeholder="https://...">
      </div>

      <div class="form-group">
        <label>URL de Captura 4</label>
        <input id="capturaUrl4" type="text" placeholder="https://...">
      </div>

      <div class="form-group">
        <label>URL de Captura 5</label>
        <input id="capturaUrl5" type="text" placeholder="https://...">
      </div>

      <div class="form-group">
        <label>URL de Captura 6</label>
        <input id="capturaUrl6" type="text" placeholder="https://...">
      </div>

      <!-- ======================= -->
      <!--   NUEVOS CAMPOS PARA ENLACES -->
      <!-- ======================= -->

      <div class="form-group">
        <label>URL del Icono (GitHub RAW u otra)</label>
        <input id="iconoUrl" type="text" placeholder="https://...">
      </div>

      <div class="form-group">
        <label>URL del APK (enlace directo)</label>
        <input id="apkUrl" type="text" placeholder="https://...">
      </div>

      <!-- ======================= -->
      <!--   ELIMINACIÓN DE SUBIR ARCHIVOS -->
      <!-- ======================= -->

      <button id="subirBtn" class="btn-primary" onclick="guardarApp()">SUBIR APP</button>

      <p class="status-text" id="estado"></p>

    </div>

  </div>

</div>

<!-- Modal para seleccionar imágenes -->
<div id="modal" style="display:none;">
  <div id="modalContent"></div>
  <button onclick="closeModal()">Cerrar</button>
</div>

<!-- Firebase -->
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-storage.js"></script>

<script src="firebase.js"></script>
<script src="admin.js"></script>

<script>
// =======================
// PROTECCIÓN DE ACCESO
// =======================
auth.onAuthStateChanged(user => {
  if (!user) location.href = "admin-login.html";
});
function logout() { auth.signOut(); }

// =======================
// VARIABLES GLOBALES
// =======================
let editId = null; 
let prevSize = null; 

// =======================
// MOSTRAR / OCULTAR LISTA
// =======================
function toggleApps() {
  const box = document.getElementById("appsContainer");
  const btn = document.getElementById("toggleBtn");

  box.classList.toggle("hidden");
  btn.textContent = box.classList.contains("hidden")
    ? "📦 Apps Subidas"
    : "📦 Ocultar Apps";
}

// =======================
// LISTADO DE APPS
// =======================
const appsList = document.getElementById("appsList");

db.collection("apps").orderBy("fecha", "desc").onSnapshot(snap => {
  appsList.innerHTML = "";

  snap.forEach(doc => {
    const a = doc.data();
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td><img src="${a.icono}" class="table-icon"></td>
      <td>${a.nombre}</td>
      <td>${a.categoria}</td>
      <td>${a.version}</td>
      <td>
        <button class="btn-edit" onclick="cargarParaEditar('${a.id}')">✏️ Editar</button>
        <button class="btn-delete" onclick="eliminarApp('${a.id}')">🗑 Eliminar</button>
      </td>
    `;

    appsList.appendChild(tr);
  });
});

// =======================
// CARGAR APP PARA EDITAR
// =======================
function cargarParaEditar(id) {
  editId = id;

  document.getElementById("formTitle").textContent = "✏️ Editar Aplicación";
  document.getElementById("subirBtn").textContent = "GUARDAR";

  db.collection("apps").doc(id).get().then(doc => {
    const a = doc.data();

    document.getElementById("nombre").value = a.nombre;
    document.getElementById("descripcion").value = a.descripcion;
    document.getElementById("version").value = a.version;
    document.getElementById("categoria").value = a.categoria;
    document.getElementById("idioma").value = a.idioma;
    document.getElementById("tipo").value = a.tipo;
    document.getElementById("internet").value = a.internet;

    document.getElementById("sistema").value = a.sistemaOperativo || "";
    document.getElementById("requisitos").value = a.requisitos || "";
    document.getElementById("fechaAct").value = a.fechaActualizacion || "";
    document.getElementById("edad").value = a.edad || "";
    document.getElementById("anuncios").value = a.anuncios || "no";
    document.getElementById("privacidad").value = a.privacidadUrl || "";

    // Asignación de las URLs de las capturas (hasta 6)
    document.getElementById("imagenUrl").value = a.imagen || "";
    for (let i = 0; i < 6; i++) {
      document.getElementById(`capturaUrl${i + 1}`).value = a.imgSecundarias ? a.imgSecundarias[i] || "" : "";
    }
    document.getElementById("iconoUrl").value = a.icono || "";  // Campo para el icono
    document.getElementById("apkUrl").value = a.apk || "";  // Campo para el APK

    prevSize = a.size || null;

    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// =======================
// ELIMINAR APP
// =======================
function eliminarApp(id) {
  if (!confirm("¿Eliminar esta aplicación?")) return;

  const ref = db.collection("apps").doc(id);

  ref.delete()
  .then(() => alert("Aplicación eliminada ✔"))
  .catch(err => alert("Error: " + err.message));
}

// =======================
// GUARDAR / EDITAR APP
// =======================
function guardarApp() {
  const nombre = document.getElementById("nombre").value.trim();
  const descripcion = document.getElementById("descripcion").value.trim();
  const version = document.getElementById("version").value.trim();
  const categoria = document.getElementById("categoria").value.trim();
  const idioma = document.getElementById("idioma").value.trim();
  const tipo = document.getElementById("tipo").value.trim();
  const internet = document.getElementById("internet").value;

  const sistema = document.getElementById("sistema").value.trim();
  const requisitos = document.getElementById("requisitos").value.trim();
  const fechaAct = document.getElementById("fechaAct").value;
  const edad = document.getElementById("edad").value.trim();
  const anuncios = document.getElementById("anuncios").value;
  const privacidad = document.getElementById("privacidad").value.trim();

  // NUEVOS CAMPOS
  const imagenUrl = document.getElementById("imagenUrl").value.trim();
  const capturasUrl1 = document.getElementById("capturaUrl1").value.trim();
  const capturasUrl2 = document.getElementById("capturaUrl2").value.trim();
  const capturasUrl3 = document.getElementById("capturaUrl3").value.trim();
  const capturasUrl4 = document.getElementById("capturaUrl4").value.trim();
  const capturasUrl5 = document.getElementById("capturaUrl5").value.trim();
  const capturasUrl6 = document.getElementById("capturaUrl6").value.trim();
  const iconoUrl = document.getElementById("iconoUrl").value.trim(); // Enlace del icono
  const apkUrl = document.getElementById("apkUrl").value.trim();  // Enlace del APK

  const estado = document.getElementById("estado");
  const btn = document.getElementById("subirBtn");

  if (!nombre || !descripcion || !version) {
    alert("Completa los campos requeridos");
    return;
  }

  btn.disabled = true;
  estado.textContent = "Procesando…";

  let docRef, id;

  if (editId === null) {
    docRef = db.collection("apps").doc();
    id = docRef.id;
  } else {
    docRef = db.collection("apps").doc(editId);
    id = editId;
  }

  // Agrupamos las URLs de las capturas
  const capturas = [capturasUrl1, capturasUrl2, capturasUrl3, capturasUrl4, capturasUrl5, capturasUrl6].filter(url => url);

  const data = {
    id,
    nombre,
    descripcion,
    version,
    categoria,
    idioma,
    tipo,
    internet,
    sistemaOperativo: sistema,
    requisitos,
    fechaActualizacion: fechaAct,
    edad,
    anuncios,
    privacidadUrl: privacidad,
    fecha: Date.now(),
    imagen: imagenUrl,
    imgSecundarias: capturas,
    icono: iconoUrl,
    apk: apkUrl,
    size: prevSize || "N/A"
  };

  docRef.set(data, { merge: true })
  .then(() => {
    estado.textContent = "Guardado ✔";
    btn.disabled = false;

    editId = null;
    prevSize = null;

    document.getElementById("formTitle").textContent = "➕ Nueva Aplicación";
    document.getElementById("subirBtn").textContent = "SUBIR APP";

    limpiarFormulario();
  })
  .catch(err => {
    estado.textContent = "Error: " + err.message;
    btn.disabled = false;
  });
}

// =======================
// LIMPIAR FORMULARIO
// =======================
function limpiarFormulario() {
  document.getElementById("nombre").value = "";
  document.getElementById("descripcion").value = "";
  document.getElementById("version").value = "";
  document.getElementById("categoria").value = "Educación";
  document.getElementById("idioma").value = "";
  document.getElementById("tipo").value = "Gratis";
  document.getElementById("internet").value = "offline";

  document.getElementById("sistema").value = "";
  document.getElementById("requisitos").value = "";
  document.getElementById("fechaAct").value = "";
  document.getElementById("edad").value = "";
  document.getElementById("anuncios").value = "no";
  document.getElementById("privacidad").value = "";

  document.getElementById("imagenUrl").value = "";
  document.getElementById("capturaUrl1").value = "";
  document.getElementById("capturaUrl2").value = "";
  document.getElementById("capturaUrl3").value = "";
  document.getElementById("capturaUrl4").value = "";
  document.getElementById("capturaUrl5").value = "";
  document.getElementById("capturaUrl6").value = "";
  document.getElementById("iconoUrl").value = "";  // Limpiar campo del icono
  document.getElementById("apkUrl").value = "";  // Limpiar campo del APK
}
