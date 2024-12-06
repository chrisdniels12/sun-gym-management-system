// DOM Elements
const addMemberEquipmentForm = document.getElementById('addMemberEquipment');
const editUsageForm = document.getElementById('edit-usage-form');
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

// Edit Usage
function editUsage(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    const modal = document.getElementById('edit-modal');

    // Fill the edit form with current data
    document.getElementById('edit-usageID').value = id;

    // Get member ID from the select option that matches the member name
    const memberName = row.cells[1].textContent;
    const memberSelect = document.getElementById('edit-memberID');
    Array.from(memberSelect.options).forEach(option => {
        if (option.text === memberName) {
            option.selected = true;
        }
    });

    // Get equipment ID from the select option that matches the equipment name
    const equipmentName = row.cells[2].textContent;
    const equipmentSelect = document.getElementById('edit-equipmentID');
    Array.from(equipmentSelect.options).forEach(option => {
        if (option.text === equipmentName) {
            option.selected = true;
        }
    });

    document.getElementById('edit-usageDate').value = row.cells[3].textContent;
    document.getElementById('edit-usageDuration').value = row.cells[4].textContent;

    modal.style.display = 'block';
}

// Update Usage
editUsageForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const id = document.getElementById('edit-usageID').value;
    const row = document.querySelector(`tr[data-id="${id}"]`);

    const formData = {
        memberID: document.getElementById("edit-memberID").value,
        equipmentID: document.getElementById("edit-equipmentID").value,
        usageDate: document.getElementById("edit-usageDate").value,
        usageDuration: document.getElementById("edit-usageDuration").value
    };

    console.log('Updating usage with data:', formData);

    try {
        const response = await fetch(`${BASE_PATH}/api/member-equipment/${id}`, {
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
            const memberSelect = document.getElementById('edit-memberID');
            const equipmentSelect = document.getElementById('edit-equipmentID');
            row.cells[1].textContent = memberSelect.options[memberSelect.selectedIndex].text;
            row.cells[2].textContent = equipmentSelect.options[equipmentSelect.selectedIndex].text;
            row.cells[3].textContent = formData.usageDate;
            row.cells[4].textContent = formData.usageDuration;

            // Show success message for 5 seconds
            const successMessage = notifications.success('Usage record updated successfully!');
            setTimeout(() => {
                successMessage.remove();
            }, 5000);
        } else {
            notifications.error(data.error || 'Failed to update usage record');
        }
    } catch (error) {
        console.error('Error:', error);
        notifications.error('Error updating usage record');
    }
});

// Delete Usage
async function deleteUsage(id) {
    if (confirm('Are you sure you want to delete this usage record?')) {
        try {
            const response = await fetch(`${BASE_PATH}/api/member-equipment/${id}`, {
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
