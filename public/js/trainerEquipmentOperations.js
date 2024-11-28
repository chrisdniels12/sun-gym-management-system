// DOM Elements
const addTrainerEquipmentForm = document.getElementById('addTrainerEquipment');
const certificationsTable = document.getElementById('certifications-table');

// Add Certification
addTrainerEquipmentForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log('Form submitted');

    // Clear any existing error messages
    clearErrors();

    const formData = {
        trainerID: document.getElementById('trainerID').value,
        equipmentID: document.getElementById('equipmentID').value,
        certificationDate: document.getElementById('certificationDate').value,
        expiryDate: document.getElementById('expiryDate').value
    };

    console.log('Sending data:', formData);

    try {
        const response = await fetch(`${BASE_PATH}/api/trainer-equipment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (response.ok) {
            showSuccess('Certification added successfully!');
            addTrainerEquipmentForm.reset();
            location.reload();
        } else {
            // Handle multiple error cases
            if (data.error === 'Duplicate entries found' && data.duplicates) {
                data.duplicates.forEach(duplicate => {
                    if (duplicate.field === 'active_certification') {
                        showError('equipmentID', `Trainer already has an active certification for this equipment`);
                    }
                });
            } else {
                showError('form', `Failed to add certification: ${data.error}`);
            }
        }
    } catch (error) {
        console.error('Error details:', error);
        showError('form', `Error adding certification: ${error.message}`);
    }
});

// Renew Certification
async function renewCertification(id) {
    if (confirm('Are you sure you want to renew this certification?')) {
        try {
            const response = await fetch(`${BASE_PATH}/api/trainer-equipment/${id}/renew`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]  // 1 year from now
                })
            });

            if (response.ok) {
                location.reload();
            } else {
                const data = await response.json();
                showError('form', `Failed to renew certification: ${data.error}`);
            }
        } catch (error) {
            console.error('Error:', error);
            showError('form', `Error renewing certification: ${error.message}`);
        }
    }
}

// Delete Certification
async function deleteCertification(id) {
    if (confirm('Are you sure you want to delete this certification?')) {
        try {
            const response = await fetch(`${BASE_PATH}/api/trainer-equipment/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                location.reload();
            } else {
                const data = await response.json();
                showError('form', `Failed to delete certification: ${data.error}`);
            }
        } catch (error) {
            console.error('Error:', error);
            showError('form', `Error deleting certification: ${error.message}`);
        }
    }
}

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
    document.querySelector('.form-section').insertBefore(successDiv, addTrainerEquipmentForm);
}

function clearErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
    const successMessages = document.querySelectorAll('.success-message');
    successMessages.forEach(msg => msg.remove());
} 