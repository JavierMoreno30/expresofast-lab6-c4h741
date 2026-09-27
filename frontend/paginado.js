//ExpresoFast - Consola Paginada
//reutiliza las utilidades de sesion definidas en app.js
//(getToken, getUsername, getRoles, fetchWithAuth, cerrarSesion
const tablaEnviosBody = document.getElementById('tablaEnviosBody');

if (tablaEnviosBody) {

    if (!getToken()) {
        window.location.href = 'index.html';
    }

    const usuarioActual = document.getElementById('usuarioActual');
    const btnLogout = document.getElementById('btnLogout');
    usuarioActual.textContent = `${getUsername()} (${getRoles().join(', ')})`;
    btnLogout.addEventListener('click', cerrarSesion);

    const formFiltros = document.getElementById('formFiltrosPaginado');
    const busquedaInput = document.getElementById('busquedaInput');
    const estadoSelect = document.getElementById('estadoSelect');
    const tamanoPaginaSelect = document.getElementById('tamanoPaginaSelect');
    const btnEjecutarSP = document.getElementById('btnEjecutarSP');

    const paginadorNav = document.getElementById('paginadorNav');
    const btnPrimera = document.getElementById('btnPrimera');
    const btnAnterior = document.getElementById('btnAnterior');
    const btnSiguiente = document.getElementById('btnSiguiente');
    const btnUltima = document.getElementById('btnUltima');
    const indicadorPagina = document.getElementById('indicadorPagina');

    //currentPage siempre en base 0 (lo que espera la API de Spring Data).
    //lo que se le muestra al usuario es currentPage + 1 (ver actualizarPaginador).
    let currentPage = 0;
    let totalPages = 1;

    async function cargarPagina(page) {
        currentPage = page;
        paginadorNav.hidden = false;

        const params = new URLSearchParams({
            page: currentPage,
            size: tamanoPaginaSelect.value
        });

        const busqueda = busquedaInput.value.trim();
        const estado = estadoSelect.value;
        if (busqueda) params.set('busqueda', busqueda);
        if (estado) params.set('estado', estado);

        tablaEnviosBody.innerHTML = '<tr><td colspan="4" class="cargando">Cargando envios...</td></tr>';

        try {
            const respuesta = await fetchWithAuth(`${API_BASE_URL}/v1/envios?${params.toString()}`);
            if (!respuesta.ok) throw new Error('No se pudo cargar la pagina de envios.');

            const data = await respuesta.json();
            totalPages = data.totalPages || 1;

            renderizarFilas(data.content);
            actualizarPaginador(data);
        } catch (error) {
            tablaEnviosBody.innerHTML = `<tr><td colspan="4" class="cargando">${error.message}</td></tr>`;
        }
    }

    async function ejecutarStoredProcedure() {
        const estado = estadoSelect.value;
        if (!estado) {
            alert('Selecciona un estado en el desplegable para ejecutar el Stored Procedure.');
            return;
        }

        paginadorNav.hidden = true;
        tablaEnviosBody.innerHTML = '<tr><td colspan="4" class="cargando">Ejecutando procedimiento almacenado...</td></tr>';

        try {
            const respuesta = await fetchWithAuth(`${API_BASE_URL}/v1/envios/procedimiento/${estado}`);
            if (!respuesta.ok) throw new Error('No se pudo ejecutar el Stored Procedure.');

            const envios = await respuesta.json();
            renderizarFilas(envios);
        } catch (error) {
            tablaEnviosBody.innerHTML = `<tr><td colspan="4" class="cargando">${error.message}</td></tr>`;
        }
    }

    function renderizarFilas(envios) {
        if (!envios || envios.length === 0) {
            tablaEnviosBody.innerHTML = '<tr><td colspan="4" class="cargando">No hay envios para mostrar.</td></tr>';
            return;
        }

        tablaEnviosBody.innerHTML = envios.map(e => `
            <tr>
                <td>${e.codigoRastreo}</td>
                <td>${e.direccionDestino}</td>
                <td>₡${e.montoFlete}</td>
                <td><span class="pill-status pill-${e.estado}">${e.estado}</span></td>
            </tr>
        `).join('');
    }

    //Error 1 del enunciado: Spring Data interpreta page=0 como la primera
    //pagina. Aca mostramos data.number + 1 al usuario, pero currentPage
    //(base 0) es lo unico que se le manda a la API.
    function actualizarPaginador(data) {
        const paginaVisible = data.number + 1;
        indicadorPagina.textContent =
            `Pagina ${paginaVisible} de ${data.totalPages} (Total: ${data.totalElements} envios)`;

        btnPrimera.disabled = data.first;
        btnAnterior.disabled = data.first;
        btnSiguiente.disabled = data.last;
        btnUltima.disabled = data.last;
    }

    formFiltros.addEventListener('submit', (evento) => {
        evento.preventDefault();
        cargarPagina(0);
    });

    btnEjecutarSP.addEventListener('click', ejecutarStoredProcedure);

    btnPrimera.addEventListener('click', () => cargarPagina(0));
    btnAnterior.addEventListener('click', () => cargarPagina(Math.max(currentPage - 1, 0)));
    btnSiguiente.addEventListener('click', () => cargarPagina(Math.min(currentPage + 1, totalPages - 1)));
    btnUltima.addEventListener('click', () => cargarPagina(totalPages - 1));

    cargarPagina(0);
}