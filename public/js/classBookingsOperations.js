// DOM Elements
const addBookingForm = document.getElementById('addBooking');
const bookingsTable = document.getElementById('bookings-table');

// Add Booking
addBookingForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log('Form submitted');

    // Clear any existing error messages
    clearErrors();

    const formData = {
        memberID: document.getElementById('memberID').value,
        classID: document.getElementById('classID').value,
        bookingDate: document.getElementById('bookingDate').value
    };

    console.log('Sending data:', formData);

    try {
        const response = await fetch('/~piercebe/CS340/sun-gym-management-system/api/class-bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (response.ok) {
            showSuccess('Booking added successfully!');
            addBookingForm.reset();
            location.reload();
        } else {
            // Handle multiple error cases
            if (data.error === 'Duplicate entries found' && data.duplicates) {
                data.duplicates.forEach(duplicate => {
                    if (duplicate.field === 'booking') {
                        showError('classID', `Member already booked for this class on ${formData.bookingDate}`);
                    }
                    if (duplicate.field === 'capacity') {
                        showError('classID', `Class is at maximum capacity`);
                    }
                });
            } else {
                showError('form', `Failed to add booking: ${data.error}`);
            }
        }
    } catch (error) {
        console.error('Error details:', error);
        showError('form', `Error adding booking: ${error.message}`);
    }
});

// Delete Booking
async function deleteBooking(id) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        try {
            const response = await fetch(`/~piercebe/CS340/sun-gym-management-system/api/class-bookings/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                location.reload();
            } else {
                const data = await response.json();
                showError('form', `Failed to cancel booking: ${data.error}`);
            }
        } catch (error) {
            console.error('Error:', error);
            showError('form', `Error canceling booking: ${error.message}`);
        }
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
    document.querySelector('.form-section').insertBefore(successDiv, addBookingForm);
}

function clearErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
    const successMessages = document.querySelectorAll('.success-message');
    successMessages.forEach(msg => msg.remove());
} 