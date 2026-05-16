let productosBD = [];

document.addEventListener('DOMContentLoaded', async () => {
    verificarSesion();
    await cargarProductos();
    actualizarContadorCarrito();

    const inputBusqueda = document.getElementById('input-busqueda');
    const selectCat = document.getElementById('select-categoria');
    const inputPrecio = document.getElementById('input-precio-max');

    if (inputBusqueda) inputBusqueda.addEventListener('input', filtrar);
    if (selectCat) selectCat.addEventListener('change', filtrar);
    if (inputPrecio) inputPrecio.addEventListener('input', filtrar);
});

async function cargarProductos() {
    try {
        const response = await fetch('/api/productos');
        productosBD = await response.json();
        renderizar(productosBD);
    } catch (error) {
        console.error("Error al conectar con la API:", error);
    }
}

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
        const imagenSource = p.imagenUrl ? p.imagenUrl : 'https://via.placeholder.com/150?text=San+Andres';

        card.innerHTML = `
            <div class="img-container">
                <img src="${imagenSource}" alt="${p.nombre}">
            </div>
            <div class="producto-info">
                <h3>${p.nombre}</h3>
                <p class="descripcion">${p.descripcion || ''}</p>
                <p class="precio">${p.precio}€</p>
                <p class="stock">Stock: <strong>${p.stock}</strong></p>
            </div>
            <div class="valoraciones-wrapper">
                <hr>
                <div class="valoraciones-seccion">
                    <h4>Opiniones</h4>
                    <div id="lista-valoraciones-${p.id}" class="lista-comentarios">
                        <span style="color: gray;">Cargando...</span>
                    </div>
                    <div class="nuevo-comentario">
                        <select id="select-estrellas-${p.id}">
                            <option value="5">5 Estrellas ★★★★★</option>
                            <option value="4">4 Estrellas ★★★★☆</option>
                            <option value="3">3 Estrellas ★★★☆☆</option>
                            <option value="2">2 Estrellas ★★☆☆☆</option>
                            <option value="1">1 Estrella ★☆☆☆☆</option>
                        </select>
                        <textarea id="input-comentario-${p.id}" placeholder="Escribe tu opinión..."></textarea>
                        <button class="btn-publicar" onclick="enviarValoracion(${p.id})">Publicar</button>
                    </div>
                </div>
            </div>
            <div class="producto-footer">
                ${p.stock > 0
                    ? `<button class="btn-carrito" onclick="agregarAlCarrito(${p.id})">Añadir al carrito</button>`
                    : '<span class="agotado">Agotado</span>'}
            </div>
        `;
        catalogo.appendChild(card);
        cargarValoraciones(p.id, document.getElementById(`lista-valoraciones-${p.id}`));
    });
}

async function cargarValoraciones(productoId, elementoContenedor) {
    if (!elementoContenedor) return;
    try {
        const res = await fetch(`/api/valoraciones/producto/${productoId}`);
        if (!res.ok) return;
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
        elementoContenedor.innerHTML = '<p style="color: red;">Error al cargar.</p>';
    }
}

async function enviarValoracion(productoId) {
    const usuarioLogueado = JSON.parse(sessionStorage.getItem('usuarioLogueado'));

    if (!usuarioLogueado) {
        Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: 'Debes iniciar sesión para dejar un comentario.',
            confirmButtonColor: '#3498db',
            confirmButtonText: 'Ir a Login'
        }).then((result) => {
            if(result.isConfirmed) window.location.href = 'login.html';
        });
        return;
    }

    const comentarioInput = document.getElementById(`input-comentario-${productoId}`);
    const estrellasInput = document.getElementById(`select-estrellas-${productoId}`);
    if (!comentarioInput || !estrellasInput) return;

    const comentario = comentarioInput.value;
    const estrellas = estrellasInput.value;

    if (!comentario.trim()) {
        Swal.fire({
            icon: 'info',
            title: 'Ups...',
            text: 'Por favor, escribe un comentario.'
        });
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

        if (res.ok) {
            Swal.fire({
                icon: 'success',
                title: '¡Gracias!',
                text: 'Tu valoración ha sido publicada',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                location.reload();
            });
        } else {
            location.reload();
        }
    } catch (error) {
        location.reload();
    }
}

function agregarAlCarrito(id) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.push(id);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();

    // Alerta tipo Toast pequeña
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Añadido al carrito',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true
    });
}

function actualizarContadorCarrito() {
    const contador = document.getElementById('cart-count');
    if (contador) {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        contador.innerText = carrito.length;
    }
}

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

            <span onclick="location.href='perfil.html'" style="cursor:pointer; color: white; font-weight:bold; margin-right:15px; display: inline-flex; align-items: center; text-decoration: none;">
                <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24" style="margin-right: 6px;">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                ${usuario.username}
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