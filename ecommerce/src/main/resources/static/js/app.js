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

// 3. Pintar productos en el index.html (CON IMÁGENES)
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
        `;
        catalogo.appendChild(card);
    });
}

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