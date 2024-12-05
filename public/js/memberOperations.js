// DOM Elements
const addMemberForm = document.getElementById('addMember');
const editMemberForm = document.getElementById('edit-member-form');
const membersTable = document.getElementById('members-table');

// Get BASE_PATH from meta tag
const BASE_PATH = document.querySelector('meta[name="base-path"]').content;

// Add Member
addMemberForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log('Form submitted');

    // Clear any existing error messages
    clearErrors();

    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        membershipType: document.getElementById('membershipType').value
    };

    console.log('Sending data:', formData);

    try {
        const response = await fetch(`${BASE_PATH}/api/members`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (response.ok) {
            notifications.success('Member added successfully!');
            addMemberForm.reset();
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
                        notifications.error(`A member with name "${duplicate.value}" already exists`);
                    }
                });
            } else {
                notifications.error(`Failed to add member: ${data.error}`);
            }
        }
    } catch (error) {
        console.error('Error details:', error);
        notifications.error(`Error adding member: ${error.message}`);
    }
});

// Edit Member
function editMember(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    const modal = document.getElementById('edit-modal');

    // Fill the edit form with current data
    document.getElementById('edit-memberID').value = id;
    document.getElementById('edit-firstName').value = row.cells[1].textContent;
    document.getElementById('edit-lastName').value = row.cells[2].textContent;
    document.getElementById('edit-email').value = row.cells[3].textContent;
    document.getElementById('edit-phone').value = row.cells[4].textContent;
    document.getElementById('edit-membershipType').value = row.cells[6].textContent;

    modal.style.display = 'block';
}

// Update Member
editMemberForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const id = document.getElementById('edit-memberID').value;

    const formData = {
        firstName: document.getElementById("edit-firstName").value,
        lastName: document.getElementById("edit-lastName").value,
        email: document.getElementById("edit-email").value,
        phoneNumber: document.getElementById("edit-phone").value,
        membershipType: document.getElementById("edit-membershipType").value
    };

    try {
        const response = await fetch(`${BASE_PATH}/api/members/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            notifications.success('Member updated successfully!');
            setTimeout(() => {
                location.reload();
            }, 5000);
        } else {
            const data = await response.json();
            notifications.error(`Failed to update member: ${data.error}`);
        }
    } catch (error) {
        console.error('Error:', error);
        notifications.error('Error updating member');
    }
});

// Delete Member
async function deleteMember(id) {
    if (confirm('Are you sure you want to delete this member?')) {
        try {
            const response = await fetch(`${BASE_PATH}/api/members/${id}`, {
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

                notifications.success('Member deleted successfully!');
                // Wait 5 seconds before reloading
                setTimeout(() => {
                    location.reload();
                }, 5000);
            } else {
                notifications.error(data.error || 'Failed to delete member');
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
