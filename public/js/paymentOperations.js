// DOM Elements
const addPaymentForm = document.getElementById('addPayment');
const paymentsTable = document.getElementById('payments-table');

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

    console.log('Sending data:', formData);

    try {
        const response = await fetch('/~piercebe/CS340/sun-gym-management-system/api/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (response.ok) {
            showSuccess('Payment added successfully!');
            addPaymentForm.reset();
            location.reload();
        } else {
            showError('form', `Failed to add payment: ${data.error}`);
        }
    } catch (error) {
        console.error('Error details:', error);
        showError('form', `Error adding payment: ${error.message}`);
    }
});

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
    document.querySelector('.form-section').insertBefore(successDiv, addPaymentForm);
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