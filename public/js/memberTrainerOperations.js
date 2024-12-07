// Get base path from meta tag
const BASE_PATH = document.querySelector('meta[name="base-path"]').content;

// Add event listener for form submission
document.getElementById('addMemberTrainer').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Get form data
    const formData = {
        memberID: document.getElementById('memberID').value,
        trainerID: document.getElementById('trainerID').value,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value || null
    };

    try {
        // Send POST request to API
        const response = await fetch(`${BASE_PATH}/api/member-trainer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            if (data.duplicates) {
                const errors = data.duplicates.map(err => {
                    switch (err.field) {
                        case 'active_assignment':
                            return 'This member already has an active training assignment';
                        case 'trainer_capacity':
                            return 'This trainer has reached their maximum capacity of active clients';
                        default:
                            return `Error with ${err.field}: ${err.value}`;
                    }
                });
                alert(errors.join('\n'));
                return;
            }
            throw new Error(data.error || 'Failed to add assignment');
        }

        // Refresh the page to show new assignment
        window.location.reload();

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to add assignment: ' + error.message);
    }
});

// Function to open edit modal
async function editAssignment(assignmentId) {
    try {
        // Fetch assignment details
        const response = await fetch(`${BASE_PATH}/api/member-trainer/${assignmentId}`);
        const assignment = await response.json();

        if (!response.ok) {
            throw new Error(assignment.error || 'Failed to fetch assignment details');
        }

        // Populate modal form
        document.getElementById('edit-memberTrainerID').value = assignment.memberTrainerID;
        document.getElementById('edit-trainerID').value = assignment.trainerID;
        document.getElementById('edit-startDate').value = assignment.startDate.split('T')[0];
        document.getElementById('edit-endDate').value = assignment.endDate ? assignment.endDate.split('T')[0] : '';

        // Show modal
        document.getElementById('edit-modal').style.display = 'block';

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load assignment details: ' + error.message);
    }
}

// Function to close edit modal
function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

// Add event listener for edit form submission
document.getElementById('edit-assignment-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const assignmentId = document.getElementById('edit-memberTrainerID').value;
    const formData = {
        trainerID: document.getElementById('edit-trainerID').value,
        startDate: document.getElementById('edit-startDate').value,
        endDate: document.getElementById('edit-endDate').value || null
    };

    try {
        const response = await fetch(`${BASE_PATH}/api/member-trainer/${assignmentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            if (data.duplicates) {
                const errors = data.duplicates.map(err => {
                    switch (err.field) {
                        case 'trainer_capacity':
                            return 'This trainer has reached their maximum capacity of active clients';
                        default:
                            return `Error with ${err.field}: ${err.value}`;
                    }
                });
                alert(errors.join('\n'));
                return;
            }
            throw new Error(data.error || 'Failed to update assignment');
        }

        // Close modal and refresh page
        closeEditModal();
        window.location.reload();

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to update assignment: ' + error.message);
    }
});

// Function to delete assignment
async function deleteAssignment(assignmentId) {
    if (!confirm('Are you sure you want to delete this assignment?')) {
        return;
    }

    try {
        const response = await fetch(`${BASE_PATH}/api/member-trainer/${assignmentId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to delete assignment');
        }

        // Refresh the page to show updated list
        window.location.reload();

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete assignment: ' + error.message);
    }
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('edit-modal');
    if (event.target === modal) {
        closeEditModal();
    }
};
