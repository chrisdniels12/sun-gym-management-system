// DOM Elements
const addEquipmentForm = document.getElementById('addEquipment');
const editEquipmentForm = document.getElementById('edit-equipment-form');
const equipmentTable = document.getElementById('equipment-table');

// Get BASE_PATH from meta tag
const BASE_PATH = document.querySelector('meta[name="base-path"]').content;

// Add Equipment
addEquipmentForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log('Form submitted');

    // Clear any existing error messages
    clearErrors();

    const formData = {
        equipmentName: document.getElementById('equipmentName').value,
        type: document.getElementById('type').value,
        status: document.getElementById('status').value,
        location: document.getElementById('location').value
    };

    console.log('Sending data:', formData);

    try {
        const response = await fetch(`${BASE_PATH}/api/equipment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (response.ok) {
            notifications.success('Equipment added successfully!');
            addEquipmentForm.reset();
            location.reload();
        } else {
            // Handle multiple error cases
            if (data.error === 'Duplicate entries found' && data.duplicates) {
                data.duplicates.forEach(duplicate => {
                    if (duplicate.field === 'name') {
                        notifications.error(`Equipment with this name already exists: ${formData.equipmentName}`);
                    }
                    if (duplicate.field === 'location') {
                        notifications.error(`Equipment already exists at this location: ${formData.location}`);
                    }
                });
            } else {
                notifications.error(`Failed to add equipment: ${data.error}`);
            }
        }
    } catch (error) {
        console.error('Error details:', error);
        notifications.error(`Error adding equipment: ${error.message}`);
    }
});

// Edit Equipment
function editEquipment(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    const modal = document.getElementById('edit-modal');

    // Fill the edit form with current data
    document.getElementById('edit-equipmentID').value = id;
    document.getElementById('edit-equipmentName').value = row.cells[1].textContent;
    document.getElementById('edit-type').value = row.cells[2].textContent;
    document.getElementById('edit-status').value = row.cells[3].textContent;
    document.getElementById('edit-location').value = row.cells[4].textContent;

    modal.style.display = 'block';
}

// Update Equipment
editEquipmentForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const id = document.getElementById('edit-equipmentID').value;
    const row = document.querySelector(`tr[data-id="${id}"]`);

    const formData = {
        equipmentName: document.getElementById("edit-equipmentName").value,
        type: document.getElementById("edit-type").value,
        status: document.getElementById("edit-status").value,
        location: document.getElementById("edit-location").value
    };

    console.log('Updating equipment with data:', formData);

    try {
        const response = await fetch(`${BASE_PATH}/api/equipment/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (response.ok) {
            // Close the modal immediately
            closeEditModal();

            // Update the row immediately
            row.cells[1].textContent = formData.equipmentName;
            row.cells[2].textContent = formData.type;
            row.cells[3].textContent = formData.status;
            row.cells[4].textContent = formData.location;

            // Show success message for 5 seconds
            notifications.success('Equipment updated successfully!');
        } else {
            notifications.error(data.error || 'Failed to update equipment');
        }
    } catch (error) {
        console.error('Error:', error);
        notifications.error('Error updating equipment');
    }
});

// Delete Equipment
async function deleteEquipment(id) {
    if (confirm('Are you sure you want to delete this equipment?')) {
        try {
            const response = await fetch(`${BASE_PATH}/api/equipment/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                // Remove the row from the table immediately
                const row = document.querySelector(`tr[data-id="${id}"]`);
                if (row) {
                    row.style.transition = 'opacity 0.3s ease';
                    row.style.opacity = '0';
                    setTimeout(() => {
                        row.remove();
                    }, 300);
                }

                notifications.success('Equipment deleted successfully!');
            } else {
                notifications.error(data.error || 'Failed to delete equipment');
            }
        } catch (error) {
            console.error('Error:', error);
            notifications.error('Error connecting to server');
        }
    }
}

// Modal functions
function closeEditModal() {
    const modal = document.getElementById('edit-modal');
    modal.style.display = 'none';
}

// Close modal if clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('edit-modal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Helper Functions
function clearErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
    const successMessages = document.querySelectorAll('.success-message');
    successMessages.forEach(msg => msg.remove());
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded');
});
