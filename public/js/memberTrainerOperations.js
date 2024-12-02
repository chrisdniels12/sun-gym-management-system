// DOM Elements
const addMemberTrainerForm = document.getElementById('addMemberTrainer');
const assignmentsTable = document.getElementById('assignments-table');

// Get BASE_PATH from meta tag
const BASE_PATH = document.querySelector('meta[name="base-path"]').content;

// Add Assignment
addMemberTrainerForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log('Form submitted');

    // Clear any existing error messages
    clearErrors();

    const formData = {
        memberID: document.getElementById('memberID').value,
        trainerID: document.getElementById('trainerID').value,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value || null
    };

    try {
        const response = await fetch(`${BASE_PATH}/api/member-trainer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (response.ok) {
            showSuccess('Training assignment added successfully!');
            addMemberTrainerForm.reset();
            location.reload();
        } else {
            // Handle multiple error cases
            if (data.error === 'Duplicate entries found' && data.duplicates) {
                data.duplicates.forEach(duplicate => {
                    if (duplicate.field === 'active_assignment') {
                        showError('memberID', `Member already has an active trainer assignment`);
                    }
                    if (duplicate.field === 'trainer_capacity') {
                        showError('trainerID', `Trainer has reached maximum client capacity`);
                    }
                });
            } else {
                showError('form', `Failed to add assignment: ${data.error}`);
            }
        }
    } catch (error) {
        console.error('Error details:', error);
        showError('form', `Error adding assignment: ${error.message}`);
    }
});

// End Assignment
async function endAssignment(id) {
    if (confirm('Are you sure you want to end this training assignment?')) {
        try {
            const response = await fetch(`${BASE_PATH}/api/member-trainer/${id}/end`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ endDate: new Date().toISOString().split('T')[0] })
            });

            if (response.ok) {
                location.reload();
            } else {
                const data = await response.json();
                showError('form', `Failed to end assignment: ${data.error}`);
            }
        } catch (error) {
            console.error('Error:', error);
            showError('form', `Error ending assignment: ${error.message}`);
        }
    }
}

// Delete Assignment
async function deleteAssignment(id) {
    if (confirm('Are you sure you want to delete this training assignment?')) {
        try {
            const response = await fetch(`${BASE_PATH}/api/member-trainer/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                location.reload();
            } else {
                const data = await response.json();
                showError('form', `Failed to delete assignment: ${data.error}`);
            }
        } catch (error) {
            console.error('Error:', error);
            showError('form', `Error deleting assignment: ${error.message}`);
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
    document.querySelector('.form-section').insertBefore(successDiv, addMemberTrainerForm);
}

function clearErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
    const successMessages = document.querySelectorAll('.success-message');
    successMessages.forEach(msg => msg.remove());
} 