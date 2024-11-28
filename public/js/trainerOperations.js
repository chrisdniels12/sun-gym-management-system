// Script to handle form submission and page refresh
document.getElementById('add-trainer-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log('Form submitted');

    // Clear any existing error messages
    clearErrors();

    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        hireDate: document.getElementById('hireDate').value,
        specialization: document.getElementById('specialization').value
    };

    console.log('Sending data:', formData);

    try {
        const response = await fetch('/~piercebe/CS340/sun-gym-management-system/api/trainers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Server response:', data); // Debug log

        if (response.ok) {
            showSuccess('Trainer added successfully!');
            document.getElementById('add-trainer-form').reset();
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
                        showError('firstName', `A trainer with name "${duplicate.value}" already exists`);
                        showError('lastName', `A trainer with name "${duplicate.value}" already exists`);
                    }
                });
            } else {
                showError('form', `Failed to add trainer: ${data.error}`);
            }
        }
    } catch (error) {
        console.error('Error details:', error);
        showError('form', `Error adding trainer: ${error.message}`);
    }
});

// Function to show error message under specific field
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#dc3545';
    errorDiv.style.fontSize = '0.875em';
    errorDiv.style.marginTop = '4px';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

// Function to show success message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.color = '#28a745';
    successDiv.style.padding = '10px';
    successDiv.style.marginBottom = '10px';
    successDiv.textContent = message;
    document.querySelector('.form-section').insertBefore(successDiv, document.getElementById('add-trainer-form'));
}

// Function to clear all error messages
function clearErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
    const successMessages = document.querySelectorAll('.success-message');
    successMessages.forEach(msg => msg.remove());
} 