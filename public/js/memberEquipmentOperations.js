// DOM Elements
const addMemberEquipmentForm = document.getElementById('addMemberEquipment');
const usageTable = document.getElementById('usage-table');

// Get BASE_PATH from meta tag
const BASE_PATH = document.querySelector('meta[name="base-path"]').content;

// Add Member Equipment Usage
addMemberEquipmentForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log('Form submitted');

    // Clear any existing error messages
    clearErrors();

    const formData = {
        memberID: document.getElementById('memberID').value,
        equipmentID: document.getElementById('equipmentID').value,
        usageDate: document.getElementById('usageDate').value,
        usageDuration: document.getElementById('usageDuration').value
    };

    try {
        const response = await fetch(`${BASE_PATH}/api/member-equipment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (response.ok) {
            // Show success message for 5 seconds
            const successMessage = notifications.success('Equipment usage recorded successfully!');

            // Add the new usage record to the table immediately
            const tbody = usageTable.querySelector('tbody');
            const newRow = document.createElement('tr');
            newRow.dataset.id = data.id;

            // Get member and equipment names from the select elements
            const memberSelect = document.getElementById('memberID');
            const equipmentSelect = document.getElementById('equipmentID');
            const memberName = memberSelect.options[memberSelect.selectedIndex].text;
            const equipmentName = equipmentSelect.options[equipmentSelect.selectedIndex].text;

            newRow.innerHTML = `
                <td>${data.id}</td>
                <td>${memberName}</td>
                <td>${equipmentName}</td>
                <td>${formData.usageDate}</td>
                <td>${formData.usageDuration}</td>
                <td>
                    <button onclick="editUsage(${data.id})" class="edit-btn">Edit</button>
                    <button onclick="deleteUsage(${data.id})" class="delete-btn">Delete</button>
                </td>
            `;
            tbody.insertBefore(newRow, tbody.firstChild);

            // Reset the form
            addMemberEquipmentForm.reset();

            // Remove success message after 5 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 5000);
        } else {
            notifications.error(`Failed to record usage: ${data.error}`);
        }
    } catch (error) {
        console.error('Error details:', error);
        notifications.error(`Error recording usage: ${error.message}`);
    }
});

// Edit and Delete functions
function editUsage(id) {
    console.log('Edit usage:', id);
    // Implement edit functionality
}

async function deleteUsage(id) {
    if (confirm('Are you sure you want to delete this usage record?')) {
        try {
            const response = await fetch(`${BASE_PATH}/api/member-equipment/${id}`, {
                method: 'DELETE'
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

                // Show success message for 5 seconds
                const successMessage = notifications.success('Usage record deleted successfully!');
                setTimeout(() => {
                    successMessage.remove();
                }, 5000);
            } else {
                notifications.error(data.error || 'Failed to delete usage record');
            }
        } catch (error) {
            console.error('Error:', error);
            notifications.error('Error connecting to server');
        }
    }
}

// Helper Functions
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
