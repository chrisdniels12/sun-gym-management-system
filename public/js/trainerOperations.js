// DOM Elements
const addTrainerForm = document.getElementById('addTrainer');
const editTrainerForm = document.getElementById('edit-trainer-form');
const trainersTable = document.getElementById('trainers-table');

// Get BASE_PATH from meta tag
const BASE_PATH = document.querySelector('meta[name="base-path"]').content;

// Add Trainer
addTrainerForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log('Form submitted');

    // Clear any existing error messages
    clearErrors();

    const formData = {
        hireDate: document.getElementById('hireDate').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        specialization: document.getElementById('specialization').value
    };

    console.log('Sending data:', formData);

    try {
        const response = await fetch(`${BASE_PATH}/api/trainers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (response.ok) {
            notifications.success('Trainer added successfully!');
            addTrainerForm.reset();
            location.reload();
        } else {
            // Handle multiple error cases
            if (data.error === 'Duplicate entries found' && data.duplicates) {
                data.duplicates.forEach(duplicate => {
                    if (duplicate.field === 'email') {
                        notifications.error(`This email address is already registered: ${duplicate.value}`);
                    }
                    if (duplicate.field === 'phone') {
                        notifications.error(`This phone number is already registered: ${duplicate.value}`);
                    }
                    if (duplicate.field === 'name') {
                        notifications.error(`A trainer with name "${duplicate.value}" already exists`);
                    }
                });
            } else {
                notifications.error(`Failed to add trainer: ${data.error}`);
            }
        }
    } catch (error) {
        console.error('Error details:', error);
        notifications.error(`Error adding trainer: ${error.message}`);
    }
});

// Edit Trainer
function editTrainer(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    const modal = document.getElementById('edit-modal');

    // Fill the edit form with current data
    document.getElementById('edit-trainerID').value = id;
    document.getElementById('edit-firstName').value = row.cells[1].textContent;
    document.getElementById('edit-lastName').value = row.cells[2].textContent;
    document.getElementById('edit-email').value = row.cells[3].textContent;
    document.getElementById('edit-phone').value = row.cells[4].textContent;
    document.getElementById('edit-specialization').value = row.cells[5].textContent.trim();

    modal.style.display = 'block';
}

// Update Trainer
editTrainerForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const id = document.getElementById('edit-trainerID').value;
    const row = document.querySelector(`tr[data-id="${id}"]`);

    const formData = {
        firstName: document.getElementById("edit-firstName").value,
        lastName: document.getElementById("edit-lastName").value,
        email: document.getElementById("edit-email").value,
        phoneNumber: document.getElementById("edit-phone").value,
        specialization: document.getElementById("edit-specialization").value
    };

    console.log('Updating trainer with data:', formData);

    try {
        const response = await fetch(`${BASE_PATH}/api/trainers/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (response.ok) {
            // Close the modal immediately
            closeEditModal();

            // Update the row immediately
            row.cells[1].textContent = formData.firstName;
            row.cells[2].textContent = formData.lastName;
            row.cells[3].textContent = formData.email;
            row.cells[4].textContent = formData.phoneNumber;
            row.cells[5].textContent = formData.specialization;

            // Show success message for 5 seconds
            notifications.success('Trainer updated successfully!');
        } else {
            notifications.error(data.error || 'Failed to update trainer');
        }
    } catch (error) {
        console.error('Error:', error);
        notifications.error('Error updating trainer');
    }
});

// Delete Trainer
async function deleteTrainer(id) {
    if (confirm('Are you sure you want to delete this trainer?')) {
        try {
            const response = await fetch(`${BASE_PATH}/api/trainers/${id}`, {
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

                notifications.success('Trainer deleted successfully!');
            } else {
                notifications.error(data.error || 'Failed to delete trainer');
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
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
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
