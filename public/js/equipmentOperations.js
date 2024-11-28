// DOM Elements
const addEquipmentForm = document.getElementById('addEquipment');
const equipmentTable = document.getElementById('equipment-table');

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
        const response = await fetch('/~piercebe/CS340/sun-gym-management-system/api/equipment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (response.ok) {
            showSuccess('Equipment added successfully!');
            addEquipmentForm.reset();
            location.reload();
        } else {
            // Handle multiple error cases
            if (data.error === 'Duplicate entries found' && data.duplicates) {
                data.duplicates.forEach(duplicate => {
                    if (duplicate.field === 'name') {
                        showError('equipmentName', `Equipment with this name already exists: ${formData.equipmentName}`);
                    }
                    if (duplicate.field === 'location') {
                        showError('location', `Equipment already exists at this location: ${formData.location}`);
                    }
                });
            } else {
                showError('form', `Failed to add equipment: ${data.error}`);
            }
        }
    } catch (error) {
        console.error('Error details:', error);
        showError('form', `Error adding equipment: ${error.message}`);
    }
});

// Helper Functions
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.querySelector('.form-section').insertBefore(successDiv, addEquipmentForm);
}

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