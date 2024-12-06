// DOM Elements
const addPaymentForm = document.getElementById('addPayment');
const editPaymentForm = document.getElementById('edit-payment-form');
const paymentsTable = document.getElementById('payments-table');

// Get BASE_PATH from meta tag
const BASE_PATH = document.querySelector('meta[name="base-path"]').content;

// Add Payment
addPaymentForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log('Form submitted');

    // Clear any existing error messages
    clearErrors();

    const formData = {
        memberID: document.getElementById('memberID').value,
        amount: document.getElementById('amount').value,
        paymentDate: document.getElementById('paymentDate').value,
        paymentMethod: document.getElementById('paymentMethod').value
    };

    try {
        const response = await fetch(`${BASE_PATH}/api/payments`, {
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
            const successMessage = notifications.success('Payment added successfully!');
            setTimeout(() => {
                successMessage.remove();
            }, 5000);

            addPaymentForm.reset();
            location.reload();
        } else {
            notifications.error(`Failed to add payment: ${data.error}`);
        }
    } catch (error) {
        console.error('Error details:', error);
        notifications.error(`Error adding payment: ${error.message}`);
    }
});

// Edit Payment
function editPayment(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    const modal = document.getElementById('edit-modal');

    // Fill the edit form with current data
    document.getElementById('edit-paymentID').value = id;

    // Get member ID from the select option that matches the member name
    const memberName = row.cells[1].textContent;
    const memberSelect = document.getElementById('edit-memberID');
    Array.from(memberSelect.options).forEach(option => {
        if (option.text === memberName) {
            option.selected = true;
        }
    });

    // Remove $ symbol from amount and set value
    document.getElementById('edit-amount').value = row.cells[2].textContent.replace('$', '');

    // Keep the original payment date
    document.getElementById('edit-paymentDate').value = row.cells[3].textContent;
    document.getElementById('edit-paymentDate').readOnly = true;

    document.getElementById('edit-paymentMethod').value = row.cells[4].textContent;

    modal.style.display = 'block';
}

// Update Payment
editPaymentForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const id = document.getElementById('edit-paymentID').value;
    const row = document.querySelector(`tr[data-id="${id}"]`);

    const formData = {
        memberID: document.getElementById("edit-memberID").value,
        amount: document.getElementById("edit-amount").value,
        paymentDate: document.getElementById("edit-paymentDate").value,
        paymentMethod: document.getElementById("edit-paymentMethod").value
    };

    console.log('Updating payment with data:', formData);

    try {
        const response = await fetch(`${BASE_PATH}/api/payments/${id}`, {
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
            row.cells[1].textContent = memberSelect.options[memberSelect.selectedIndex].text;
            row.cells[2].textContent = `$${formData.amount}`;
            row.cells[3].textContent = formData.paymentDate;
            row.cells[4].textContent = formData.paymentMethod;

            // Show success message for 5 seconds
            const successMessage = notifications.success('Payment updated successfully!');
            setTimeout(() => {
                successMessage.remove();
            }, 5000);
        } else {
            notifications.error(data.error || 'Failed to update payment');
        }
    } catch (error) {
        console.error('Error:', error);
        notifications.error('Error updating payment');
    }
});

// Delete Payment
async function deletePayment(id) {
    if (confirm('Are you sure you want to delete this payment?')) {
        try {
            const response = await fetch(`${BASE_PATH}/api/payments/${id}`, {
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
                const successMessage = notifications.success('Payment deleted successfully!');
                setTimeout(() => {
                    successMessage.remove();
                }, 5000);
            } else {
                notifications.error(data.error || 'Failed to delete payment');
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
