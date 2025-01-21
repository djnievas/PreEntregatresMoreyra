// Funciones existentes
function guardarFactura(cliente, monto, fecha) {
    const facturas = obtenerFacturas();
    const nuevaFactura = { id: generarID(), cliente, monto, fecha: fecha.toISOString() };
    facturas.push(nuevaFactura);

    // Convertir el array de facturas a una cadena JSON antes de almacenarlo
    localStorage.setItem('facturas', JSON.stringify(facturas));
}

function obtenerFacturas() {
    let facturas;
    try {
        facturas = JSON.parse(localStorage.getItem('facturas'));
    } catch (error) {
        console.error('Error al obtener facturas:', error);
        facturas = [];
    }
    if (!Array.isArray(facturas)) {
        facturas = [];
    }
    return facturas.map(factura => ({
        ...factura,
        fecha: new Date(factura.fecha)
    }));
}

function mostrarFacturas() {
    const facturas = obtenerFacturas();
    const tableBody = document.getElementById('facturasTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';  // Limpiar la tabla antes de mostrar las nuevas facturas

    facturas.forEach(factura => {
        const row = tableBody.insertRow(-1);
        row.insertCell(0).textContent = factura.id;
        row.insertCell(1).textContent = factura.cliente;
        row.insertCell(2).textContent = `$${factura.monto.toFixed(2)}`;
        row.insertCell(3).textContent = factura.fecha.toDateString();

        // Botones de acción
        const actionsCell = row.insertCell(4);
        actionsCell.innerHTML = `
            <button class="edit-btn">Editar</button>
            <button class="delete-btn">Eliminar</button>
        `;
    });

    // Agregar event listener para todos los botones de acción (editar, eliminar)
    tableBody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const facturaId = btn.closest('tr').cells[0].textContent;
            editarFactura(facturaId);
        });
    });

    tableBody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const facturaId = btn.closest('tr').cells[0].textContent;
            if (confirm('¿Está seguro de que desea eliminar esta factura?')) {
                eliminarFactura(facturaId);
            }
        });
    });
}

// Funciones nuevas
function generarID() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function editarFactura(facturaId) {
    const facturas = JSON.parse(localStorage.getItem('facturas') || '[]');

    // Buscar la factura por ID
    const facturaEditada = facturas.find(f => f.id === facturaId);

    if (facturaEditada) {
        const editForm = document.getElementById('facturaForm');
        editForm.style.display = 'block';
        document.getElementById('editButton').style.display = 'none';

        const clienteInput = editForm.elements['cliente'];
        clienteInput.value = facturaEditada.cliente;

        const montoInput = editForm.elements['monto'];
        montoInput.value = facturaEditada.monto.toFixed(2);

        const fechaInput = editForm.elements['fecha'];
        fechaInput.value = new Date(facturaEditada.fecha).toISOString().split('T')[0];

        document.getElementById('saveButton').textContent = 'Actualizar Factura';
        document.getElementById('deleteButton').textContent = 'Cancelar Edición';

        // Eliminar el evento anterior para evitar agregarlo múltiples veces
        const saveButton = document.getElementById('saveButton');
        saveButton.removeEventListener('click', actualizarFactura); // Eliminar el evento anterior

        // Añadir un único eventListener para el botón de guardar (actualizar)
        saveButton.addEventListener('click', function actualizarFactura() {
            const cliente = clienteInput.value;
            const monto = parseFloat(montoInput.value);
            const fecha = new Date(fechaInput.value);

            if (!isNaN(monto) && !isNaN(fecha.getTime())) {
                // Actualizar la factura en el array y en localStorage
                const index = facturas.findIndex(f => f.id === facturaId);
                facturas[index] = { id: facturaId, cliente, monto, fecha: fecha.toISOString() };
                localStorage.setItem('facturas', JSON.stringify(facturas));

                mostrarFacturas();  // Mostrar las facturas actualizadas
                editForm.style.display = 'none';  // Ocultar el formulario de edición
                document.getElementById('editButton').style.display = '';  // Mostrar el botón de edición
                document.getElementById('saveButton').textContent = 'Guardar Factura';  // Restablecer el texto del botón
                document.getElementById('deleteButton').textContent = 'Eliminar';  // Restablecer el texto del botón de eliminar
            } else {
                alert('Por favor, ingrese datos válidos.');
            }
        });

        // Eliminar la factura si se cancela la edición
        document.getElementById('deleteButton').addEventListener('click', function cancelarEdicion() {
            mostrarFacturas();  // Mostrar las facturas actuales
            editForm.style.display = 'none';  // Ocultar el formulario de edición
            document.getElementById('editButton').style.display = '';  // Mostrar el botón de edición
            document.getElementById('saveButton').textContent = 'Guardar Factura';  // Restablecer el texto del botón
            document.getElementById('deleteButton').textContent = 'Eliminar';  // Restablecer el texto del botón de eliminar
        });
    }
}


function eliminarFactura(facturaId) {
    const facturas = obtenerFacturas();
    const nuevaFacturas = facturas.filter(f => f.id !== facturaId);
    localStorage.setItem('facturas', JSON.stringify(nuevaFacturas));
    mostrarFacturas();
}

// Event listener para el formulario
document.getElementById('facturaForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const cliente = this.elements['cliente'].value;
    const monto = parseFloat(this.elements['monto'].value);
    const fecha = new Date(this.elements['fecha'].value);

    if (isNaN(monto) || fecha.toString() === 'Invalid Date') {
        alert('Por favor, ingrese datos válidos.');
        return;
    }

    guardarFactura(cliente, monto, fecha);
    mostrarFacturas();
    this.reset(); // Reiniciar el formulario
});

// Mostrar facturas al cargar la página
window.onload = mostrarFacturas;

