const API_BASE_URL = 'http://localhost:8080/api';

//Utilidades de sesion (sessionStorage: se borra al cerrar la pestaña)
function getToken() {
    return sessionStorage.getItem('jwt_token');
}

function getUsername() {
    return sessionStorage.getItem('jwt_username');
}

function getRoles() {
    const roles = sessionStorage.getItem('jwt_roles');
    return roles ? JSON.parse(roles) : [];
}

function tieneRol(...rolesPermitidos) {
    const rolesUsuario = getRoles();
    return rolesPermitidos.some(r => rolesUsuario.includes(r));
}

function guardarSesion(token, username, roles) {
    sessionStorage.setItem('jwt_token', token);
    sessionStorage.setItem('jwt_username', username);
    sessionStorage.setItem('jwt_roles', JSON.stringify(roles));
}

function cerrarSesion() {
    sessionStorage.removeItem('jwt_token');
    sessionStorage.removeItem('jwt_username');
    sessionStorage.removeItem('jwt_roles');
    window.location.href = 'index.html';
}

// -----------------------------------------------------------
// fetchWithAuth: agrega el header Authorization automaticamente
// y maneja expiracion de sesion (401/403)
// -----------------------------------------------------------
async function fetchWithAuth(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
        ...(options.headers || {})
    };

    const respuesta = await fetch(url, { ...options, headers });

   if (respuesta.status === 401) {
        cerrarSesion();
        throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
    }

    if (respuesta.status === 403) {
        //Lanza el error para que lo capture el catch() del formulario, pero no cierra la sesión
        throw new Error('Acceso denegado: No tienes permisos para realizar esta acción.');
    }

    return respuesta;
}
function extraerMensajeError(datos) {
    if (datos.detalles) {
        return Object.entries(datos.detalles)
            .map(([campo, mensaje]) => `${campo}: ${mensaje}`)
            .join(' | ');
    }
    return datos.error || 'Ocurrio un error inesperado.';
}
//LOGICA DE index.html (Login)
const formLogin = document.getElementById('loginForm');

if (formLogin) {
    const mensajeLogin = document.getElementById('mensajeLogin');

    formLogin.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const respuesta = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(extraerMensajeError(datos));
            }

            guardarSesion(datos.token, datos.username, datos.roles);
            window.location.href = 'dashboard.html';
        } catch (error) {
            mensajeLogin.textContent = error.message;
            mensajeLogin.className = 'mensaje-form error';
        }
    });
}

//LOGICA DE dashboard.html (Consola de Operacion)
const enviosGrid = document.getElementById('enviosGrid');

if (enviosGrid) {

    if (!getToken()) {
        window.location.href = 'index.html';
    }

    let enviosCache = [];
    let bitacoraCache = [];
    let filtroActual = 'TODOS';

    const filtrosLista = document.getElementById('filtrosLista');
    const formEnvio = document.getElementById('formEnvio');
    const mensajeForm = document.getElementById('mensajeForm');
    const usuarioActual = document.getElementById('usuarioActual');
    const btnLogout = document.getElementById('btnLogout');
    const nuevoEnvioSection = document.getElementById('nuevoEnvioSection');
    const asideAdmin = document.getElementById('asideAdmin');
    const formVehiculo = document.getElementById('formVehiculo');
    const mensajeVehiculo = document.getElementById('mensajeVehiculo');

    const kpiTotalEnvios = document.getElementById('kpiTotalEnvios');
    const kpiVehiculosActivos = document.getElementById('kpiVehiculosActivos');
    const kpiPaquetesEntregados = document.getElementById('kpiPaquetesEntregados');

    const modalBitacora = document.getElementById('modalBitacora');
    const modalBitacoraTitulo = document.getElementById('modalBitacoraTitulo');
    const bitacoraLista = document.getElementById('bitacoraLista');
    const btnCerrarModal = document.getElementById('btnCerrarModal');
    const filtroFechaInicio = document.getElementById('filtroFechaInicio');
    const filtroFechaFin = document.getElementById('filtroFechaFin');
    const btnLimpiarFiltroFecha = document.getElementById('btnLimpiarFiltroFecha');

    // -----------------------------------------------------------
    // Inicializar interfaz segun el rol del usuario autenticado
    // -----------------------------------------------------------
    function inicializarInterfazSegunRol() {
        usuarioActual.textContent = `${getUsername()} (${getRoles().join(', ')})`;

        //solo ADMIN y OPERADOR pueden crear envios (POST /api/envios en el backend)
        if (!tieneRol('ROLE_ADMIN', 'ROLE_OPERADOR')) {
            nuevoEnvioSection.hidden = true;
        }

        //solo ADMIN ve el panel lateral (bitacora + registro de vehiculos)
        if (tieneRol('ROLE_ADMIN')) {
            asideAdmin.hidden = false;
            cargarVehiculosActivos();
        } else {
            asideAdmin.hidden = true;
            kpiVehiculosActivos.textContent = '—';
        }
    }

    btnLogout.addEventListener('click', cerrarSesion);

    //KPIs
    function actualizarKpis() {
        kpiTotalEnvios.textContent = enviosCache.length;
        kpiPaquetesEntregados.textContent = enviosCache.filter(e => e.estadoEnvio === 'ENTREGADO').length;
    }

    async function cargarVehiculosActivos() {
        try {
            const respuesta = await fetchWithAuth(`${API_BASE_URL}/vehiculos`);
            if (!respuesta.ok) return;
            const vehiculos = await respuesta.json();
            kpiVehiculosActivos.textContent = vehiculos.filter(v => v.estado === 'DISPONIBLE').length;
        } catch (error) {
            console.error(error);
        }
    }

    // -----------------------------------------------------------
    // Cargar envios (GET /api/envios/optimizados)
    // -----------------------------------------------------------
    async function cargarEnvios() {
        try {
            enviosGrid.innerHTML = '<p class="cargando">Cargando envios...</p>';
            const respuesta = await fetchWithAuth(`${API_BASE_URL}/envios/optimizados`);

            if (!respuesta.ok) {
                throw new Error('Error al consultar los envios: ' + respuesta.status);
            }

            enviosCache = await respuesta.json();
            actualizarKpis();
            renderizarEnvios();
        } catch (error) {
            enviosGrid.innerHTML = `<p class="cargando">No se pudo conectar con el servidor: ${error.message}</p>`;
            console.error(error);
        }
    }

    // -----------------------------------------------------------
    // Renderizar tarjetas <article> segun filtro y rol
    // -----------------------------------------------------------
    function renderizarEnvios() {
        const enviosFiltrados = filtroActual === 'TODOS'
            ? enviosCache
            : enviosCache.filter(e => e.estadoEnvio === filtroActual);

        if (enviosFiltrados.length === 0) {
            enviosGrid.innerHTML = '<p class="cargando">No hay envios para este filtro.</p>';
            return;
        }

        //botones de cambio de estado: solo ADMIN y CONDUCTOR pueden
        //ejecutar PATCH /api/envios/{id}/estado segun la matriz RBAC del backend.
        const puedeCambiarEstado = tieneRol('ROLE_ADMIN', 'ROLE_CONDUCTOR');
        const puedeVerBitacora = tieneRol('ROLE_ADMIN', 'ROLE_OPERADOR');

        enviosGrid.innerHTML = enviosFiltrados.map(envio => `
            <article class="envio-card" data-id="${envio.id}">
                <h3>${envio.codigoRastreo}</h3>
                <span class="pill-status pill-${envio.estadoEnvio}">${envio.estadoEnvio}</span>
                <p><strong>Destino:</strong> ${envio.direccionDestino}</p>
                <p><strong>Peso:</strong> ${envio.pesoKg} kg</p>
                <p><strong>Costo:</strong> ₡${envio.costo}</p>
                <p><strong>Vehiculo:</strong> ${envio.placaVehiculo || 'N/A'}</p>
                <p><strong>Conductor:</strong> ${envio.nombreConductor || 'N/A'}</p>
                <div class="envio-acciones">
                    ${puedeCambiarEstado ? `<button class="btn-transito" onclick="cambiarEstado(${envio.id}, 'EN_TRANSITO')">Marcar en Transito</button>` : ''}
                    ${puedeCambiarEstado ? `<button class="btn-entregado" onclick="cambiarEstado(${envio.id}, 'ENTREGADO')">Marcar Entregado</button>` : ''}
                    ${puedeVerBitacora ? `<button class="btn-bitacora" onclick="abrirBitacora(${envio.id}, '${envio.codigoRastreo}')">Ver Bitacora</button>` : ''}
                </div>
            </article>
        `).join('');
    }

    // -----------------------------------------------------------
    // Registrar un nuevo envio (POST /api/envios)
    // -----------------------------------------------------------
    if (formEnvio) {
        formEnvio.addEventListener('submit', async (evento) => {
            evento.preventDefault();

            const payload = {
                codigoRastreo: document.getElementById('codigoRastreo').value,
                direccionDestino: document.getElementById('direccionDestino').value,
                pesoKg: parseFloat(document.getElementById('pesoKg').value),
                costo: parseFloat(document.getElementById('costo').value),
                vehiculoId: parseInt(document.getElementById('vehiculoId').value),
                conductorId: parseInt(document.getElementById('conductorId').value)
            };

            try {
                const respuesta = await fetchWithAuth(`${API_BASE_URL}/envios`, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });

                const datos = await respuesta.json();

                if (!respuesta.ok) {
                    throw new Error(extraerMensajeError(datos));
                }

                mostrarMensaje(mensajeForm, 'Envio registrado correctamente.', 'exito');
                formEnvio.reset();
                cargarEnvios();
            } catch (error) {
                mostrarMensaje(mensajeForm, error.message, 'error');
            }
        });
    }

    // -----------------------------------------------------------
    // Registrar un nuevo vehiculo (POST /api/vehiculos, solo ADMIN)
    // -----------------------------------------------------------
    if (formVehiculo) {
        formVehiculo.addEventListener('submit', async (evento) => {
            evento.preventDefault();

            const payload = {
                placa: document.getElementById('placaVehiculo').value,
                capacidadKg: parseFloat(document.getElementById('capacidadVehiculo').value)
            };

            try {
                const respuesta = await fetchWithAuth(`${API_BASE_URL}/vehiculos`, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });

                const datos = await respuesta.json();

                if (!respuesta.ok) {
                    throw new Error(extraerMensajeError(datos));
                }

                mostrarMensaje(mensajeVehiculo, `Vehiculo ${datos.placa} registrado.`, 'exito');
                formVehiculo.reset();
                cargarVehiculosActivos();
            } catch (error) {
                mostrarMensaje(mensajeVehiculo, error.message, 'error');
            }
        });
    }

    function mostrarMensaje(elemento, texto, tipo) {
        elemento.textContent = texto;
        elemento.className = `mensaje-form ${tipo}`;
    }

    // -----------------------------------------------------------
    // Cambiar estado de un envio (PATCH /api/envios/{id}/estado)
    // -----------------------------------------------------------
    window.cambiarEstado = async function (envioId, nuevoEstado) {
        const observaciones = prompt('Observaciones para este cambio de estado (opcional):', '') || '';

        try {
            const respuesta = await fetchWithAuth(`${API_BASE_URL}/envios/${envioId}/estado`, {
                method: 'PATCH',
                body: JSON.stringify({ nuevoEstado, observaciones })
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(extraerMensajeError(datos));
            }

            cargarEnvios();
        } catch (error) {
            alert('Error: ' + error.message);
            console.error(error);
        }
    };

    // -----------------------------------------------------------
    // Modal de Bitacora de Auditoria
    // -----------------------------------------------------------
    window.abrirBitacora = async function (envioId, codigoRastreo) {
        modalBitacoraTitulo.textContent = `Bitacora del Envio ${codigoRastreo}`;
        bitacoraLista.innerHTML = '<p class="cargando">Cargando bitacora...</p>';
        filtroFechaInicio.value = '';
        filtroFechaFin.value = '';
        modalBitacora.classList.remove('oculto');

        try {
            const respuesta = await fetchWithAuth(`${API_BASE_URL}/envios/${envioId}/bitacora`);

            if (!respuesta.ok) {
                throw new Error('No se pudo cargar la bitacora.');
            }

            bitacoraCache = await respuesta.json();
            renderizarBitacora();
        } catch (error) {
            bitacoraLista.innerHTML = `<p class="cargando">${error.message}</p>`;
        }
    };

    function renderizarBitacora() {
        let entradas = bitacoraCache;

        const desde = filtroFechaInicio.value ? new Date(filtroFechaInicio.value) : null;
        const hasta = filtroFechaFin.value ? new Date(filtroFechaFin.value) : null;

        if (desde) {
            entradas = entradas.filter(b => new Date(b.fechaCambio) >= desde);
        }
        if (hasta) {
            const hastaFin = new Date(hasta);
            hastaFin.setHours(23, 59, 59, 999);
            entradas = entradas.filter(b => new Date(b.fechaCambio) <= hastaFin);
        }

        if (entradas.length === 0) {
            bitacoraLista.innerHTML = '<p class="cargando">No hay registros en este rango de fechas.</p>';
            return;
        }

        bitacoraLista.innerHTML = entradas.map(b => `
            <div class="bitacora-item">
                <div class="bitacora-transicion">
                    <span class="pill-status pill-${b.estadoAnterior}">${b.estadoAnterior}</span>
                    <span class="bitacora-flecha">&rarr;</span>
                    <span class="pill-status pill-${b.estadoNuevo}">${b.estadoNuevo}</span>
                </div>
                <p><strong>Fecha:</strong> ${new Date(b.fechaCambio).toLocaleString('es-CR')}</p>
                <p><strong>Usuario:</strong> ${b.usuario}</p>
                ${b.observaciones ? `<p><strong>Observaciones:</strong> ${b.observaciones}</p>` : ''}
            </div>
        `).join('');
    }

    //Event Listeners protegidos contra null
    if (filtroFechaInicio) filtroFechaInicio.addEventListener('change', renderizarBitacora);
    if (filtroFechaFin) filtroFechaFin.addEventListener('change', renderizarBitacora);
    
    if (btnLimpiarFiltroFecha) {
        btnLimpiarFiltroFecha.addEventListener('click', () => {
            filtroFechaInicio.value = '';
            filtroFechaFin.value = '';
            renderizarBitacora();
        });
    }

    if (btnCerrarModal) {
        btnCerrarModal.addEventListener('click', () => modalBitacora.classList.add('oculto'));
    }

    if (modalBitacora) {
        modalBitacora.addEventListener('click', (evento) => {
            if (evento.target === modalBitacora) modalBitacora.classList.add('oculto');
        });
    }

    if (filtrosLista) {
        filtrosLista.addEventListener('click', (evento) => {
            const boton = evento.target.closest('.filtro-btn');
            if (!boton) return;

            document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('activo'));
            boton.classList.add('activo');

            filtroActual = boton.dataset.estado;
            renderizarEnvios();
        });
    }

    //Inicializacion (Ejecutar directamente)
    inicializarInterfazSegunRol();
    cargarEnvios();
} //Fin del if (enviosGrid)