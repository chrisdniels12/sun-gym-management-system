// memberClient.js - Client-side Member Management Logic

// DOM Elements
const addMemberForm = document.getElementById('addMemberForm');
const membersTable = document.getElementById('membersTable');

// Add form validation functions
function validateEmail(email) {
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
}

function validatePhone(phone) {
    return !phone || /^\+?[\d\s-]{10,20}$/.test(phone);
}

function validateMemberData(data) {
    const errors = [];

    if (!data.firstName?.trim()) errors.push('First name is required');
    if (!data.lastName?.trim()) errors.push('Last name is required');
    if (!data.email?.trim()) errors.push('Email is required');
    if (!validateEmail(data.email)) errors.push('Invalid email format');
    if (data.phoneNumber && !validatePhone(data.phoneNumber)) errors.push('Invalid phone number format');
    if (!data.membershipType) errors.push('Membership type is required');

    return errors;
}

/**
 * Handle member form submission
 * Adds a new member via API and updates the UI
 */
addMemberForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(addMemberForm);
    const memberData = Object.fromEntries(formData);

    // Validate form data
    const errors = validateMemberData(memberData);
    if (errors.length > 0) {
        showAlert(errors.join('\n'), 'error');
        return;
    }

    try {
        const response = await fetch('/api/members', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(memberData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to add member');
        }

        addMemberToTable({
            memberID: result.id,
            ...memberData,
            joinDate: new Date().toISOString().split('T')[0]
        });
        addMemberForm.reset();
        showAlert('Member added successfully', 'success');
    } catch (error) {
        showAlert(error.message, 'error');
        console.error('Error adding member:', error);
    }
});

/**
 * Delete a member
 * @param {number} id - Member ID to delete
 */
async function deleteMember(id) {
    if (!id) {
        showAlert('Invalid member ID', 'error');
        return;
    }

    if (!confirm('Are you sure you want to delete this member?')) {
        return;
    }

    try {
        const response = await fetch(`/api/members/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete member');
        }

        const row = document.querySelector(`tr[data-id="${id}"]`);
        if (row) {
            row.remove();
            showAlert('Member deleted successfully', 'success');
        } else {
            throw new Error('Member row not found in table');
        }
    } catch (error) {
        console.error('Error deleting member:', error);
        showAlert(error.message, 'error');
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
    if (!member || !member.memberID) {
        console.error('Invalid member data:', member);
        return;
    }

    const tbody = membersTable.querySelector('tbody');
    if (!tbody) {
        console.error('Table body not found');
        return;
    }

    const row = document.createElement('tr');
    row.setAttribute('data-id', member.memberID);

    try {
        row.innerHTML = `
            <td>${member.memberID}</td>
            <td>${member.firstName} ${member.lastName}</td>
            <td>${member.email}</td>
            <td>${member.phoneNumber || 'N/A'}</td>
            <td>${new Date(member.joinDate).toLocaleDateString()}</td>
            <td>${member.membershipType}</td>
            <td>
                <button onclick="editMember(${member.memberID})" class="btn-edit">Edit</button>
                <button onclick="deleteMember(${member.memberID})" class="btn-delete">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    } catch (error) {
        console.error('Error adding row to table:', error);
        showAlert('Error updating table', 'error');
    }
}

/**
 * Display alert messages
 * @param {string} message - Message to display
 * @param {string} type - Type of alert ('success' or 'error')
 */
function showAlert(message, type) {
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.position = 'fixed';
    alert.style.top = '20px';
    alert.style.right = '20px';
    alert.style.zIndex = '1000';

    document.body.appendChild(alert);

    setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}
