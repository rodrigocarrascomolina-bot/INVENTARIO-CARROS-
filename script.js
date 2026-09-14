let inventory = JSON.parse(localStorage.getItem('bomberos_inventario')) || [];
let currentCar = 'B1';

const form = document.getElementById('material-form');
const formTitle = document.getElementById('form-title');
const editIdInput = document.getElementById('edit-id');
const carInput = document.getElementById('material-car');
const nameInput = document.getElementById('material-name');
const brandInput = document.getElementById('material-brand');
const colorInput = document.getElementById('material-color');
const quantityInput = document.getElementById('material-quantity');
const compartmentInput = document.getElementById('material-compartment');
const noveltyInput = document.getElementById('material-novelty');
const btnSubmit = document.getElementById('btn-submit');
const btnCancel = document.getElementById('btn-cancel');

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const id = editIdInput.value;
    const car = carInput.value;
    const name = nameInput.value.trim();
    
    // Si están vacíos, colocamos un guión bajo por defecto
    const brand = brandInput.value.trim() || "---";
    const color = colorInput.value.trim() || "---";
    const quantity = quantityInput.value.trim() || "---";
    const compartment = compartmentInput.value.trim() || "---";
    const novelty = noveltyInput.value.trim() || "Sin novedades";

    if (id) {
        inventory = inventory.map(item => item.id === id ? { ...item, car, name, brand, color, quantity, compartment, novelty } : item);
        resetForm();
    } else {
        inventory.push({ id: Date.now().toString(), car, name, brand, color, quantity, compartment, novelty, present: true });
        form.reset();
    }
    saveAndRender();
});

function saveAndRender() {
    localStorage.setItem('bomberos_inventario', JSON.stringify(inventory));
    renderTable();
}

function switchCar(carName) {
    currentCar = carName;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.textContent === carName ? btn.classList.add('active') : btn.classList.remove('active');
    });
    carInput.value = carName;
    renderTable();
}

function renderTable() {
    const tbody = document.getElementById('inventory-table-body');
    const emptyNotice = document.getElementById('empty-notice');
    tbody.innerHTML = '';

    const filteredItems = inventory.filter(item => item.car === currentCar);

    if (filteredItems.length === 0) {
        emptyNotice.style.display = 'block';
        return;
    } else {
        emptyNotice.style.display = 'none';
    }

    filteredItems.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = `item-row ${item.present ? '' : 'missing'}`;

        tr.innerHTML = `
            <td class="checkbox-cell action-to-hide">
                <input type="checkbox" ${item.present ? 'checked' : ''} onchange="togglePresence('${item.id}')">
            </td>
            <td class="pdf-status-cell" style="display:none; font-weight: bold; color: ${item.present ? 'green' : 'red'}">
                ${item.present ? '✓ SI' : '✗ NO'}
            </td>
            <td><strong>${item.name}</strong></td>
            <td>${item.brand}</td>
            <td>${item.color}</td>
            <td><span>${item.quantity}</span></td>
            <td><span style="color: #555;">${item.compartment}</span></td>
            <td>${item.novelty}</td>
            <td class="actions-cell action-to-hide">
                <button class="btn-edit" onclick="editItem('${item.id}')">Editar</button>
                <button class="btn-delete" onclick="deleteItem('${item.id}')">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function togglePresence(id) {
    inventory = inventory.map(item => item.id === id ? { ...item, present: !item.present } : item);
    saveAndRender();
}

// Cargar para editar (limpia los "---" para que el usuario pueda escribir cómodo)
function editItem(id) {
    const item = inventory.find(i => i.id === id);
    if (item) {
        formTitle.textContent = "Editar Material";
        editIdInput.value = item.id;
        carInput.value = item.car;
        nameInput.value = item.name;
        brandInput.value = item.brand === "---" ? "" : item.brand;
        colorInput.value = item.color === "---" ? "" : item.color;
        quantityInput.value = item.quantity === "---" ? "" : item.quantity;
        compartmentInput.value = item.compartment === "---" ? "" : item.compartment;
        noveltyInput.value = item.novelty === "Sin novedades" ? "" : item.novelty;
        btnSubmit.textContent = "Actualizar Cambios";
        btnCancel.style.display = "inline-block";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function deleteItem(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este material?")) {
        inventory = inventory.filter(item => item.id !== id);
        saveAndRender();
    }
}

btnCancel.addEventListener('click', resetForm);

function resetForm() {
    formTitle.textContent = "Agregar Nuevo Material";
    editIdInput.value = "";
    form.reset();
    carInput.value = currentCar;
    btnSubmit.textContent = "Guardar Material";
    btnCancel.style.display = "none";
}

function prepareReportMetadata() {
    document.getElementById('pdf-subtitle').textContent = `Inventario Oficial de Materiales - Unidad: ${currentCar}`;
    const hoy = new Date();
    document.getElementById('pdf-date').textContent = `Fecha de extracción: ${hoy.toLocaleDateString()} a las ${hoy.toLocaleTimeString()}`;
}

function exportToPDF() {
    const element = document.getElementById('pdf-area');
    const pdfHeader = document.getElementById('pdf-header');
    const thCheck = document.getElementById('th-check');
    const thStatePdf = document.getElementById('th-state-pdf');
    
    prepareReportMetadata();

    pdfHeader.style.display = "block";
    thCheck.style.display = "none";       
    thStatePdf.style.display = "table-cell"; 
    
    document.querySelectorAll('.action-to-hide').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.actions-cell-header').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.pdf-status-cell').forEach(el => el.style.display = 'table-cell');

    const opciones = {
        margin: 10,
        filename: `Inventario_Bomberos_${currentCar}_${new Date().toISOString().slice(0,10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opciones).from(element).save().then(() => {
        pdfHeader.style.display = "none";
        thCheck.style.display = "table-cell";
        thStatePdf.style.display = "none";
        
        document.querySelectorAll('.action-to-hide').forEach(el => el.style.display = 'table-cell');
        document.querySelectorAll('.actions-cell-header').forEach(el => el.style.display = 'table-cell');
        document.querySelectorAll('.pdf-status-cell').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.checkbox-cell').forEach(el => el.style.display = 'table-cell');
    });
}

function printInventory() {
    prepareReportMetadata();
    window.print();
}

renderTable();