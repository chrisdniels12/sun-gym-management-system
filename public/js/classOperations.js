// DOM Elements
const addClassForm = document.getElementById('addClass');
const classesTable = document.getElementById('classes-table');

// Add Class
addClassForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log('Form submitted');

    // Clear any existing error messages
    clearErrors();

    const formData = {
        className: document.getElementById('className').value,
        trainerID: document.getElementById('trainerID').value,
        scheduleTime: document.getElementById('scheduleTime').value,
        scheduleDay: document.getElementById('scheduleDay').value,
        maxCapacity: document.getElementById('maxCapacity').value
    };

    console.log('Sending data:', formData);

    try {
        const response = await fetch('/~piercebe/CS340/sun-gym-management-system/api/classes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (response.ok) {
            showSuccess('Class added successfully!');
            addClassForm.reset();
            location.reload();
        } else {
            // Handle multiple error cases
            if (data.error === 'Duplicate entries found' && data.duplicates) {
                data.duplicates.forEach(duplicate => {
                    if (duplicate.field === 'time_slot') {
                        showError('scheduleTime', `A class already exists at this time: ${formData.scheduleTime} on ${formData.scheduleDay}`);
                        showError('scheduleDay', `A class already exists at this time: ${formData.scheduleTime} on ${formData.scheduleDay}`);
                    }
                    if (duplicate.field === 'trainer_schedule') {
                        showError('trainerID', `This trainer is already scheduled at this time`);
                    }
                });
            } else {
                showError('form', `Failed to add class: ${data.error}`);
            }
        }
    } catch (error) {
        console.error('Error details:', error);
        showError('form', `Error adding class: ${error.message}`);
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
    document.querySelector('.form-section').insertBefore(successDiv, addClassForm);
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