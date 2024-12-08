// DOM Elements
const addMemberEquipmentForm = document.getElementById('addMemberEquipment');
const usageTable = document.getElementById('usage-table');

// Get BASE_PATH from meta tag
const BASE_PATH = document.querySelector('meta[name="base-path"]').content;

// Add Member Equipment Usage
addMemberEquipmentForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log('Form submitted');

    // Clear any existing error messages
    clearErrors();

    const formData = {
        memberID: document.getElementById('memberID').value,
        equipmentID: document.getElementById('equipmentID').value,
        usageDate: document.getElementById('usageDate').value,
        usageDuration: document.getElementById('usageDuration').value
    };

    try {
        const response = await fetch(`${BASE_PATH}/api/member-equipment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (response.ok) {
            showSuccess('Equipment usage recorded successfully!');
            addMemberEquipmentForm.reset();
            location.reload();
        } else {
            showError('form', `Failed to record usage: ${data.error}`);
        }
    } catch (error) {
        console.error('Error details:', error);
        showError('form', `Error recording usage: ${error.message}`);
    }
});

// Edit and Delete functions
function editUsage(id) {
    console.log('Edit usage:', id);
    // Implement edit functionality
}

function deleteUsage(id) {
    if (confirm('Are you sure you want to delete this usage record?')) {
        fetch(`${BASE_PATH}/api/member-equipment/${id}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    location.reload();
                }
            })
            .catch(error => console.error('Error:', error));
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
    document.querySelector('.form-section').insertBefore(successDiv, addMemberEquipmentForm);
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