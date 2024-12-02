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
            showSuccess('Member added successfully!');
            addMemberForm.reset();
            location.reload();
        } else {
            // Handle multiple error cases
            if (data.error === 'Duplicate entries found' && data.duplicates) {
                data.duplicates.forEach(duplicate => {
                    if (duplicate.field === 'email') {
                        showError('email', `This email address is already registered: ${duplicate.value}`);
                    }
                    if (duplicate.field === 'phone') {
                        showError('phoneNumber', `This phone number is already registered: ${duplicate.value}`);
                    }
                    if (duplicate.field === 'name') {
                        showError('firstName', `A member with name "${duplicate.value}" already exists`);
                        showError('lastName', `A member with name "${duplicate.value}" already exists`);
                    }
                });
            } else {
                showError('form', `Failed to add member: ${data.error}`);
            }
        }
    } catch (error) {
        console.error('Error details:', error);
        showError('form', `Error adding member: ${error.message}`);
    }
});

// Edit Member
function editMember(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    const modal = document.getElementById('edit-modal');

    // Fill the edit form with current data
    document.getElementById('edit-memberID').value = id;
    document.getElementById('edit-firstName').value = row.cells[1].textContent.split(' ')[0];
    document.getElementById('edit-lastName').value = row.cells[1].textContent.split(' ')[1];
    document.getElementById('edit-email').value = row.cells[2].textContent;
    document.getElementById('edit-phone').value = row.cells[3].textContent;
    document.getElementById('edit-membershipType').value = row.cells[4].textContent;

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
            location.reload(); // Refresh to show updated data
        } else {
            throw new Error('Failed to update member');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating member');
    }
});

// Delete Member
function deleteMember(id) {
    if (confirm('Are you sure you want to delete this member?')) {
        fetch(`${BASE_PATH}/api/members/${id}`, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    location.reload(); // Refresh to show deletion
                }
            })
            .catch(error => console.error('Error:', error));
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

async function loadMembers() {
    try {
        console.log('Fetching members...'); // Add this log
        const response = await fetch(`${BASE_PATH}/api/members`);
        console.log('Response:', response); // Add this log

        if (!response.ok) {
            throw new Error('Failed to fetch members');
        }

        const members = await response.json();
        console.log('Members data:', members); // Add this log

        // Update the table with the members data
        const tbody = document.querySelector('#members-table tbody');
        tbody.innerHTML = ''; // Clear existing rows

        members.forEach(member => {
            tbody.innerHTML += `
                <tr>
                    <td>${member.memberID}</td>
                    <td>${member.firstName}</td>
                    <td>${member.lastName}</td>
                    <td>${member.email}</td>
                    <td>${member.phoneNumber || 'N/A'}</td>
                    <td>${new Date(member.joinDate).toLocaleDateString()}</td>
                    <td>${member.membershipType}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error loading members:', error);
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
    document.querySelector('.form-section').insertBefore(successDiv, addMemberForm);
}

function clearErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
    const successMessages = document.querySelectorAll('.success-message');
    successMessages.forEach(msg => msg.remove());
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, calling loadMembers()');
    loadMembers();
});
