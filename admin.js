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
// CONVERTIR GITHUB A RAW
// =======================
function convertirGithubRAW(url) {
  if (!url) return null;
  if (!url.includes("github.com")) return url;

  return url
    .replace("https://github.com/", "https://raw.githubusercontent.com/")
    .replace("/blob/", "/");
}

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
      <td><img src="${a.imagen}" class="table-icon"></td>
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

    prevSize = a.size || null;

    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// =======================
// ELIMINAR APP
// =======================
function eliminarApp(id) {
  if (!confirm("¿Eliminar esta aplicación?")) return;

  db.collection("apps").doc(id).delete()
    .then(() => alert("Aplicación eliminada ✔"))
    .catch(err => alert("Error: " + err.message));
}

// =======================
// GUARDAR / EDITAR APP
// =======================
function guardarApp() {

  const nombre = nombre.value.trim();
  const descripcion = descripcion.value.trim();
  const version = version.value.trim();
  const categoria = categoria.value.trim();
  const idioma = idioma.value.trim();
  const tipo = tipo.value.trim();
  const internet = internet.value;

  const sistema = sistema.value.trim();
  const requisitos = requisitos.value.trim();
  const fechaAct = fechaAct.value;
  const edad = edad.value.trim();
  const anuncios = anuncios.value;
  const privacidad = privacidad.value.trim();

  // SOPORTE PARA URLs DIRECTAS DESDE GITHUB
  let imgUrl = convertirGithubRAW(document.getElementById("imagenUrl")?.value || null);
  let apkUrl = convertirGithubRAW(document.getElementById("apkUrl")?.value || null);

  // Archivos en caso de no usar URL
  const apkFile = document.getElementById("apk").files[0];
  const imgFile = document.getElementById("imagen").files[0];

  // Capturas desde URL o archivos
  let capturasUrl = convertirGithubRAW(document.getElementById("capturasUrl")?.value || "");
  const capturasFiles = document.getElementById("capturas").files;

  const estado = document.getElementById("estado");
  const btn = document.getElementById("subirBtn");

  if (!nombre || !descripcion || !version) {
    alert("Completa los campos requeridos");
    return;
  }

  btn.disabled = true;
  estado.textContent = "Procesando…";

  let docRef, id;

  if (!editId) {
    docRef = db.collection("apps").doc();
    id = docRef.id;
  } else {
    docRef = db.collection("apps").doc(editId);
    id = editId;
  }

  // FUNCIÓN SUBIR ARCHIVOS
  function upload(path, file) {
    return storage.ref(path).put(file).then(() => 
      storage.ref(path).getDownloadURL()
    );
  }

  // SUBIR IMAGEN SOLO SI NO HAY URL
  let promesaImg =
    imgUrl ? Promise.resolve(imgUrl)
    : imgFile ? upload(`imagenes/${id}.jpg`, imgFile)
    : Promise.resolve(null);

  // SUBIR APK SOLO SI NO HAY URL
  let promesaApk =
    apkUrl ? Promise.resolve(apkUrl)
    : apkFile ? upload(`apks/${id}.apk`, apkFile)
    : Promise.resolve(null);

  // CAPTURAS
  let promesaCapturas;

  if (capturasUrl) {
    promesaCapturas = Promise.resolve(
      capturasUrl.split(",").map(u => convertirGithubRAW(u.trim()))
    );
  } else {
    let uploads = [];
    for (let i = 0; i < capturasFiles.length; i++) {
      uploads.push(upload(`screens/${id}-${i}.jpg`, capturasFiles[i]));
    }
    promesaCapturas = Promise.all(uploads);
  }

  // GUARDAR TODO
  Promise.all([promesaImg, promesaApk, promesaCapturas]).then(([imgURL, apkURL, capturasFinal]) => {

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
      fecha: Date.now()
    };

    if (imgURL) data.imagen = imgURL;
    if (apkURL) data.apk = apkURL;
    if (capturasFinal?.length) data.imgSecundarias = capturasFinal;

    if (!editId) {
      data.ratingAvg = 0;
      data.ratingCount = 0;
      data.starsBreakdown = { 1:0,2:0,3:0,4:0,5:0 };
      data.descargasReales = 0;
    }

    return docRef.set(data, { merge: true });
  })
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
  nombre.value = "";
  descripcion.value = "";
  version.value = "";
  categoria.value = "Educación";
  idioma.value = "";
  tipo.value = "Gratis";
  internet.value = "offline";

  sistema.value = "";
  requisitos.value = "";
  fechaAct.value = "";
  edad.value = "";
  anuncios.value = "no";
  privacidad.value = "";

  if (document.getElementById("imagenUrl")) document.getElementById("imagenUrl").value = "";
  if (document.getElementById("apkUrl")) document.getElementById("apkUrl").value = "";
  if (document.getElementById("capturasUrl")) document.getElementById("capturasUrl").value = "";

  imagen.value = "";
  apk.value = "";
  capturas.value = "";
}
