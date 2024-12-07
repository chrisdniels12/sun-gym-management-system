// Get base path from meta tag
const BASE_PATH = document.querySelector('meta[name="base-path"]').content;

// Add event listener for form submission
document.getElementById('addBooking').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Get form data
    const formData = {
        memberID: document.getElementById('memberID').value,
        classID: document.getElementById('classID').value,
        bookingDate: document.getElementById('bookingDate').value
    };

    try {
        // Send POST request to API
        const response = await fetch(`${BASE_PATH}/api/class-bookings`, {
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
                        case 'booking':
                            return 'This member already has a booking for this class on this date';
                        case 'capacity':
                            return 'This class has reached its maximum capacity for this date';
                        default:
                            return `Error with ${err.field}: ${err.value}`;
                    }
                });
                alert(errors.join('\n'));
                return;
            }
            throw new Error(data.error || 'Failed to add booking');
        }

        // Refresh the page to show new booking
        window.location.reload();

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to add booking: ' + error.message);
    }
});

// Function to open edit modal
async function editBooking(bookingId) {
    try {
        // Fetch booking details
        const response = await fetch(`${BASE_PATH}/api/class-bookings/${bookingId}`);
        const booking = await response.json();

        if (!response.ok) {
            throw new Error(booking.error || 'Failed to fetch booking details');
        }

        // Populate modal form
        document.getElementById('edit-bookingID').value = booking.bookingID;
        document.getElementById('edit-memberID').value = booking.memberID;
        document.getElementById('edit-classID').value = booking.classID;
        document.querySelector('.member-name-display').textContent = booking.memberName;
        document.querySelector('.booking-date-display').textContent = booking.bookingDate;

        // Show modal
        document.getElementById('edit-modal').style.display = 'block';

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load booking details: ' + error.message);
    }
}

// Function to close edit modal
function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

// Add event listener for edit form submission
document.getElementById('edit-booking-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const bookingId = document.getElementById('edit-bookingID').value;
    const formData = {
        memberID: document.getElementById('edit-memberID').value,
        classID: document.getElementById('edit-classID').value,
        bookingDate: document.querySelector('.booking-date-display').textContent
    };

    try {
        const response = await fetch(`${BASE_PATH}/api/class-bookings/${bookingId}`, {
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
                        case 'capacity':
                            return 'This class has reached its maximum capacity for this date';
                        default:
                            return `Error with ${err.field}: ${err.value}`;
                    }
                });
                alert(errors.join('\n'));
                return;
            }
            throw new Error(data.error || 'Failed to update booking');
        }

        // Close modal and refresh page
        closeEditModal();
        window.location.reload();

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to update booking: ' + error.message);
    }
});

// Function to delete booking
async function deleteBooking(bookingId) {
    if (!confirm('Are you sure you want to delete this booking?')) {
        return;
    }

    try {
        const response = await fetch(`${BASE_PATH}/api/class-bookings/${bookingId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to delete booking');
        }

        // Refresh the page to show updated list
        window.location.reload();

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete booking: ' + error.message);
    }
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('edit-modal');
    if (event.target === modal) {
        closeEditModal();
    }
};
