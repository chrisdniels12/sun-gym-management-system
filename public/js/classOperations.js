// DOM Elements
const addClassForm = document.getElementById('addClass');
const editClassForm = document.getElementById('edit-class-form');
const classesTable = document.getElementById('classes-table');

// Get BASE_PATH from meta tag
const BASE_PATH = document.querySelector('meta[name="base-path"]').content;

// Add Class
addClassForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log('Form submitted');

    // Clear any existing error messages
    clearErrors();

    const formData = {
        className: document.getElementById('className').value,
        trainerID: document.getElementById('trainerID').value || null,
        scheduleTime: document.getElementById('scheduleTime').value,
        scheduleDay: document.getElementById('scheduleDay').value,
        maxCapacity: document.getElementById('maxCapacity').value
    };

    console.log('Sending data:', formData);

    try {
        const response = await fetch(`${BASE_PATH}/api/classes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (response.ok) {
            // Reset form immediately
            addClassForm.reset();
            // Show success message and reload after 5 seconds
            notifications.success('Class added successfully!');
            // Set a timeout to reload the page after the notification duration
            setTimeout(() => {
                location.reload();
            }, 5000);
        } else {
            // Handle multiple error cases
            if (data.error === 'Duplicate entries found' && data.duplicates) {
                data.duplicates.forEach(duplicate => {
                    if (duplicate.field === 'time_slot') {
                        notifications.error(`A class already exists at this time: ${formData.scheduleTime} on ${formData.scheduleDay}`);
                    }
                    if (duplicate.field === 'trainer_schedule') {
                        notifications.error(`This trainer is already scheduled at this time`);
                    }
                });
            } else {
                notifications.error(`Failed to add class: ${data.error}`);
            }
        }
    } catch (error) {
        console.error('Error details:', error);
        notifications.error(`Error adding class: ${error.message}`);
    }
});

// Edit Class
function editClass(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    const modal = document.getElementById('edit-modal');

    // Fill the edit form with current data
    document.getElementById('edit-classID').value = id;
    document.getElementById('edit-className').value = row.cells[1].textContent;

    // Handle trainer selection
    const trainerName = row.cells[2].textContent;
    const trainerSelect = document.getElementById('edit-trainerID');
    if (trainerName && trainerName !== 'null') {
        // Find and select the matching trainer option
        Array.from(trainerSelect.options).forEach(option => {
            if (option.text === trainerName) {
                option.selected = true;
            }
        });
    } else {
        trainerSelect.value = ''; // Select the empty option
    }

    document.getElementById('edit-scheduleDay').value = row.cells[3].textContent;
    document.getElementById('edit-scheduleTime').value = row.cells[4].textContent;

    // Extract capacity number from "current/max" format
    const capacityText = row.cells[5].textContent;
    const maxCapacity = capacityText.split('/')[1];
    document.getElementById('edit-maxCapacity').value = maxCapacity;

    modal.style.display = 'block';
}

// Update Class
editClassForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const id = document.getElementById('edit-classID').value;
    const row = document.querySelector(`tr[data-id="${id}"]`);

    const formData = {
        className: document.getElementById("edit-className").value,
        trainerID: document.getElementById("edit-trainerID").value || null,
        scheduleTime: document.getElementById("edit-scheduleTime").value,
        scheduleDay: document.getElementById("edit-scheduleDay").value,
        maxCapacity: document.getElementById("edit-maxCapacity").value
    };

    console.log('Updating class with data:', formData);

    try {
        const response = await fetch(`${BASE_PATH}/api/classes/${id}`, {
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
            row.cells[1].textContent = formData.className;
            // Get trainer name from selected option
            const trainerSelect = document.getElementById('edit-trainerID');
            row.cells[2].textContent = formData.trainerID ?
                trainerSelect.options[trainerSelect.selectedIndex].text : '';
            row.cells[3].textContent = formData.scheduleDay;
            row.cells[4].textContent = formData.scheduleTime;
            // Keep current enrollment number when updating capacity
            const currentEnrollment = row.cells[5].textContent.split('/')[0];
            row.cells[5].textContent = `${currentEnrollment}/${formData.maxCapacity}`;

            // Show success message for 5 seconds
            notifications.success('Class updated successfully!');
        } else {
            notifications.error(data.error || 'Failed to update class');
        }
    } catch (error) {
        console.error('Error:', error);
        notifications.error('Error updating class');
    }
});

// Delete Class
async function deleteClass(id) {
    if (confirm('Are you sure you want to delete this class?')) {
        try {
            const response = await fetch(`${BASE_PATH}/api/classes/${id}`, {
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

                notifications.success('Class deleted successfully!');
            } else {
                notifications.error(data.error || 'Failed to delete class');
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
