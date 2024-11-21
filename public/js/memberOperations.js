// Combine add, update, and delete operations in one file
// DOM Elements
const addMemberForm = document.getElementById('add-member-form');
const updateMemberForm = document.getElementById('update-member-form');
const membersTable = document.getElementById('members-table');

// Add Member
addMemberForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Get form data
    const formData = {
        firstName: document.getElementById("input-firstName").value,
        lastName: document.getElementById("input-lastName").value,
        email: document.getElementById("input-email").value,
        phoneNumber: document.getElementById("input-phone").value,
        membershipType: document.getElementById("input-membershipType").value
    };

    try {
        const response = await fetch('/members', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const newMember = await response.json();
            addMemberToTable(newMember);
            addMemberForm.reset();
            showAlert('Member added successfully', 'success');
        } else {
            throw new Error('Failed to add member');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error adding member', 'error');
    }
});

// Update Member
async function updateMember(id) {
    const formData = {
        firstName: document.getElementById("edit-firstName").value,
        lastName: document.getElementById("edit-lastName").value,
        email: document.getElementById("edit-email").value,
        phoneNumber: document.getElementById("edit-phone").value,
        membershipType: document.getElementById("edit-membershipType").value
    };

    try {
        const response = await fetch(`/members/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const updatedMember = await response.json();
            updateMemberInTable(updatedMember);
            closeEditModal();
            showAlert('Member updated successfully');
        } else {
            throw new Error('Failed to update member');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error updating member', 'error');
    }
}
