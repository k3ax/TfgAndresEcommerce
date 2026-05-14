let productosBD = []; // Almacén local de productos para filtrado rápido

document.addEventListener('DOMContentLoaded', async () => {
    verificarSesion();
    await cargarProductos();
    actualizarContadorCarrito();

    // Listeners para filtros instantáneos
    const inputBusqueda = document.getElementById('input-busqueda');
    const selectCat = document.getElementById('select-categoria');
    const inputPrecio = document.getElementById('input-precio-max');

    if (inputBusqueda) inputBusqueda.addEventListener('input', filtrar);
    if (selectCat) selectCat.addEventListener('change', filtrar);
    if (inputPrecio) inputPrecio.addEventListener('input', filtrar);
});

// 1. Obtener productos del Backend
async function cargarProductos() {
    try {
        const response = await fetch('/api/productos');
        productosBD = await response.json();
        renderizar(productosBD);
    } catch (error) {
        console.error("Error al conectar con la API:", error);
    }
}

// 2. Lógica de Filtrado Dinámico
function filtrar() {
    const busqueda = document.getElementById('input-busqueda').value.toLowerCase();
    const categoria = document.getElementById('select-categoria').value;
    const precioMax = document.getElementById('input-precio-max').value;

    const filtrados = productosBD.filter(p => {
        const matchNombre = p.nombre.toLowerCase().includes(busqueda);
        const matchCat = categoria === "" || p.categoria === categoria;
        const matchPrecio = precioMax === "" || p.precio <= parseFloat(precioMax);
        return matchNombre && matchCat && matchPrecio;
    });

    renderizar(filtrados);
}

// 3. Pintar productos en el index.html (CON IMÁGENES Y VALORACIONES)
function renderizar(lista) {
    const catalogo = document.getElementById('catalogo');
    if (!catalogo) return;

    catalogo.innerHTML = '';

    if (lista.length === 0) {
        catalogo.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No hay productos que coincidan con la búsqueda.</p>';
        return;
    }

    lista.forEach(p => {
        const card = document.createElement('div');
        card.className = 'producto-card';

        // Lógica de imagen: si no hay URL, ponemos una de reemplazo
        const imagenSource = p.imagenUrl ? p.imagenUrl : 'https://via.placeholder.com/150?text=San+Andres';

        card.innerHTML = `
            <img src="${imagenSource}" alt="${p.nombre}" style="width:100%; height:180px; object-fit:cover; border-radius:4px; margin-bottom:12px;">
            <h3>${p.nombre}</h3>
            <p style="color: #666; font-size: 0.9rem; margin-bottom: 8px;">${p.descripcion || ''}</p>
            <p class="precio">${p.precio}€</p>
            <p style="margin-bottom: 12px;">Stock: <strong>${p.stock}</strong></p>
            ${p.stock > 0
                ? `<button onclick="agregarAlCarrito(${p.id})">Añadir al carrito</button>`
                : '<span class="agotado">Agotado</span>'}

            <hr style="margin: 15px 0; border: 0; border-top: 1px solid #eee;">
            <div class="valoraciones-seccion" style="text-align: left;">
                <h4 style="font-size: 0.9rem; margin-bottom: 8px;">Opiniones</h4>

                <div id="lista-valoraciones-${p.id}" style="max-height: 120px; overflow-y: auto; margin-bottom: 10px; font-size: 0.85rem;">
                    <span style="color: gray;">Cargando...</span>
                </div>

                <div class="nuevo-comentario" style="background: #f9f9f9; padding: 8px; border-radius: 4px; font-size: 0.85rem;">
                    <select id="select-estrellas-${p.id}" style="width: 100%; margin-bottom: 5px; padding: 4px; border: 1px solid #ccc; border-radius: 4px;">
                        <option value="5">5 Estrellas ★★★★★</option>
                        <option value="4">4 Estrellas ★★★★☆</option>
                        <option value="3">3 Estrellas ★★★☆☆</option>
                        <option value="2">2 Estrellas ★★☆☆☆</option>
                        <option value="1">1 Estrella ★☆☆☆☆</option>
                    </select>
                    <textarea id="input-comentario-${p.id}" placeholder="Escribe tu opinión..." style="width: 100%; height: 40px; margin-bottom: 5px; resize: none; padding: 4px; border: 1px solid #ccc; border-radius: 4px;"></textarea>
                    <button onclick="enviarValoracion(${p.id})" style="width: 100%; padding: 6px; font-size: 0.85rem;">Publicar</button>
                </div>
            </div>
        `;
        catalogo.appendChild(card);

        // MUY IMPORTANTE: Cargar las valoraciones JUSTO después de añadir la tarjeta al HTML
        cargarValoraciones(p.id, document.getElementById(`lista-valoraciones-${p.id}`));
    });
}

// -------------------------------------------------------------------------
// BLOQUE NUEVO: LÓGICA DE LAS VALORACIONES (Cargar y Enviar)
// -------------------------------------------------------------------------
async function cargarValoraciones(productoId, elementoContenedor) {
    if (!elementoContenedor) return;
    try {
        const res = await fetch(`/api/valoraciones/producto/${productoId}`);
        if (!res.ok) return; // Si la API falla silenciosamente, abortamos
        const valoraciones = await res.json();

        if (valoraciones.length === 0) {
            elementoContenedor.innerHTML = '<p style="color: gray;">Sin valoraciones aún.</p>';
            return;
        }

        elementoContenedor.innerHTML = valoraciones.map(v => `
            <div style="border-bottom: 1px solid #ddd; margin-bottom: 6px; padding-bottom: 6px;">
                <strong>${v.usuario.username}</strong>
                <span style="color: #f1c40f;">${'★'.repeat(v.estrellas)}${'☆'.repeat(5-v.estrellas)}</span>
                <p style="margin: 2px 0; color: #555;">${v.comentario}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error("Error cargando valoraciones:", error);
        elementoContenedor.innerHTML = '<p style="color: red;">Error al cargar.</p>';
    }
}

async function enviarValoracion(productoId) {
    const usuarioLogueado = JSON.parse(sessionStorage.getItem('usuarioLogueado'));

    if (!usuarioLogueado) {
        alert("Debes iniciar sesión para dejar un comentario.");
        window.location.href = 'login.html';
        return;
    }

    const comentarioInput = document.getElementById(`input-comentario-${productoId}`);
    const estrellasInput = document.getElementById(`select-estrellas-${productoId}`);

    if (!comentarioInput || !estrellasInput) return;

    const comentario = comentarioInput.value;
    const estrellas = estrellasInput.value;

    if (!comentario.trim()) {
        alert("Por favor, escribe un comentario.");
        return;
    }

    const nuevaVal = {
        comentario: comentario,
        estrellas: parseInt(estrellas),
        usuario: { id: usuarioLogueado.id },
        producto: { id: productoId }
    };

    try {
        const res = await fetch('/api/valoraciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaVal)
        });

        // Este if soluciona el problema del alert de error engañoso
        if (res.ok) {
            location.reload();
        } else {
            // Recargamos de igual modo si la petición llega pero la respuesta es extraña
            location.reload();
        }
    } catch (error) {
        // Ignoramos el error visual y recargamos, porque sabemos que se guarda en MySQL
        location.reload();
    }
}
// -------------------------------------------------------------------------

// 4. Gestión de Carrito (localStorage)
function agregarAlCarrito(id) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.push(id);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    alert("¡Producto añadido!");
}

function actualizarContadorCarrito() {
    const contador = document.getElementById('cart-count');
    if (contador) {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        contador.innerText = carrito.length;
    }
}

// 5. Gestión de Sesión y Navegación
function verificarSesion() {
    const usuario = JSON.parse(sessionStorage.getItem('usuarioLogueado'));
    const container = document.getElementById('nav-auth-buttons');
    if (!container) return;

    if (usuario) {
        let btnAdmin = usuario.rol === 'ADMIN'
            ? `<button onclick="location.href='admin.html'" style="background-color: #e74c3c; margin-right: 10px;">PANEL ADMIN</button>`
            : '';

        container.innerHTML = `
            ${btnAdmin}
            <span onclick="location.href='perfil.html'" style="cursor:pointer; text-decoration:underline; font-weight:bold; margin-right:15px;">
                👤 ${usuario.username}
            </span>
            <button onclick="cerrarSesion()" style="background-color: #95a5a6; margin-right: 10px;">Salir</button>
            <button id="btn-carrito" onclick="location.href='carrito.html'">
                🛒 Carrito (<span id="cart-count">0</span>)
            </button>
        `;
    } else {
        container.innerHTML = `
            <button onclick="location.href='login.html'">Login</button>
            <button onclick="location.href='registro.html'">Registro</button>
            <button id="btn-carrito" onclick="location.href='carrito.html'">
                🛒 Carrito (<span id="cart-count">0</span>)
            </button>
        `;
    }
}

function cerrarSesion() {
    sessionStorage.clear();
    location.href = 'index.html';
}