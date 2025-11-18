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

    // Campos URL
    document.getElementById("imagenUrl").value = a.imagen || "";
    document.getElementById("capturasUrl").value = a.imgSecundarias ? a.imgSecundarias.join(",") : "";
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
async function guardarApp() {
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
  const imagenFile = document.getElementById("imagen").files[0];
  const apkFile = document.getElementById("apk").files[0];
  const capturasFiles = document.getElementById("capturas").files;

  // Inicializamos las variables para las URLs
  let imagenUrl = document.getElementById("imagenUrl").value.trim();  // URL existente
  let apkUrl = document.getElementById("apkUrl").value.trim();  // URL existente
  let capturasUrls = capturasFiles.length > 0 ? [] : document.getElementById("capturasUrl").value.split(",").map(u => u.trim()); // URLs existentes

  // Subir los archivos a Firebase Storage solo si son nuevos
  const storageRef = firebase.storage().ref();

  // Subir Imagen principal si se ha seleccionado un nuevo archivo
  if (imagenFile) {
    const imagenRef = storageRef.child('images/' + imagenFile.name);
    await imagenRef.put(imagenFile);
    imagenUrl = await imagenRef.getDownloadURL();  // Actualizamos la URL
  }

  // Subir APK si se ha seleccionado un nuevo archivo
  if (apkFile) {
    const apkRef = storageRef.child('apk/' + apkFile.name);
    await apkRef.put(apkFile);
    apkUrl = await apkRef.getDownloadURL();  // Actualizamos la URL
  }

  // Subir Capturas si se han seleccionado nuevas imágenes
  if (capturasFiles.length > 0) {
    capturasUrls = [];
    for (const file of capturasFiles) {
      const capturaRef = storageRef.child('capturas/' + file.name);
      await capturaRef.put(file);
      const capturaUrl = await capturaRef.getDownloadURL();
      capturasUrls.push(capturaUrl);
    }
  }

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
    imagen: imagenUrl,  // Usar la URL existente o nueva
    imgSecundarias: capturasUrls,  // Usar URLs de capturas existentes o nuevas
    icono: "",  // Puedes añadir un campo para icono si es necesario
    apk: apkUrl,  // Usar la URL existente o nueva
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
  document.getElementById("capturasUrl").value = "";
  document.getElementById("iconoUrl").value = "";  // Limpiar campo del icono
  document.getElementById("apkUrl").value = "";  // Limpiar campo del APK

  // Desactivar los campos de carga de archivos
  document.getElementById("apk").value = "";
  document.getElementById("imagen").value = "";
  document.getElementById("capturas").value = "";
}
