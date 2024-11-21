// memberClient.js - Client-side Member Management Logic

// DOM Elements
const addMemberForm = document.getElementById('addMemberForm');
const membersTable = document.getElementById('membersTable');

/**
 * Handle member form submission
 * Adds a new member via API and updates the UI
 */
addMemberForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Extract form data
    const formData = new FormData(addMemberForm);
    const memberData = Object.fromEntries(formData);

    try {
        const response = await fetch('/api/members', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(memberData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add member');
        }

        const result = await response.json();
        // Optionally, you can update the table without reloading
        addMemberToTable({
            memberID: result.id,
            ...memberData,
            joinDate: new Date().toISOString().split('T')[0] // Assuming current date
        });
        addMemberForm.reset();
        showAlert('Member added successfully', 'success');
    } catch (error) {
        showAlert(error.message, 'error');
    }
});

/**
 * Delete a member
 * @param {number} id - Member ID to delete
 */
async function deleteMember(id) {
    if (!confirm('Are you sure you want to delete this member?')) {
        return;
    }

    try {
        const response = await fetch(`/members/delete/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok && data.message === 'Member deleted successfully') {
            const row = document.querySelector(`tr[data-id="${id}"]`);
            if (row) row.remove();
            showAlert('Member deleted successfully', 'success');
        } else {
            showAlert(data.error || 'Error deleting member', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error deleting member', 'error');
    }
}

/**
 * Handle member editing
 * Redirects to the edit form for the specific member
 * @param {number} memberId - ID of the member to edit
 */
function editMember(memberId) {
    window.location.href = `/members/edit/${memberId}`;
}

/**
 * Add a new member row to the members table
 * @param {object} member - Member data
 */
function addMemberToTable(member) {
    const row = document.createElement('tr');
    row.setAttribute('data-id', member.memberID);

    row.innerHTML = `
        <td>${member.memberID}</td>
        <td>${member.firstName} ${member.lastName}</td>
        <td>${member.email}</td>
        <td>${member.phoneNumber || 'N/A'}</td>
        <td>${member.joinDate}</td>
        <td>${member.membershipType}</td>
        <td>
            <button onclick="editMember(${member.memberID})">Edit</button>
            <button onclick="deleteMember(${member.memberID})">Delete</button>
        </td>
    `;

    membersTable.querySelector('tbody').appendChild(row);
}

/**
 * Display alert messages
 * @param {string} message - Message to display
 * @param {string} type - Type of alert ('success' or 'error')
 */
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
}
