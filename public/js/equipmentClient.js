// Equipment management client-side logic
const equipmentForm = document.getElementById('add-equipment-form');
const equipmentTable = document.getElementById('equipment-table');

// Form validation
function validateEquipmentData(data) {
    const errors = [];
    if (!data.equipmentName?.trim()) errors.push('Equipment name required');
    if (!data.equipmentType) errors.push('Equipment type required');
    if (!data.purchaseDate) errors.push('Purchase date required');
    return errors;
}

// Add new equipment
equipmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
        equipmentName: document.getElementById('input-name').value,
        equipmentType: document.getElementById('input-type').value,
        purchaseDate: document.getElementById('input-purchase-date').value,
        status: 'Available'
    };

    const errors = validateEquipmentData(formData);
    if (errors.length > 0) {
        showAlert(errors.join(', '), 'error');
        return;
    }

    try {
        const response = await fetch('/api/equipment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const newEquipment = await response.json();
            addEquipmentToTable(newEquipment);
            equipmentForm.reset();
            showAlert('Equipment added successfully', 'success');
        }
    } catch (error) {
        showAlert('Error adding equipment', 'error');
    }
});

// Update equipment status
async function updateEquipmentStatus(id, status) {
    try {
        const response = await fetch(`/api/equipment/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            updateTableRow(id, { status });
            showAlert('Status updated successfully', 'success');
        }
    } catch (error) {
        showAlert('Error updating status', 'error');
    }
} 