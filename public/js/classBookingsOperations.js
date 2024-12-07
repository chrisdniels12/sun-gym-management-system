// DOM Elements
const addBookingForm = document.getElementById('addBooking');
const editBookingForm = document.getElementById('edit-booking-form');
const bookingsTable = document.getElementById('bookings-table');

// Get BASE_PATH from meta tag
const BASE_PATH = document.querySelector('meta[name="base-path"]').content;

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

    try {
        const response = await fetch(`${BASE_PATH}/api/class-bookings`, {
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
            const successMessage = notifications.success('Booking added successfully!');

            // Add the new booking to the table immediately
            const tbody = bookingsTable.querySelector('tbody');
            const newRow = document.createElement('tr');
            newRow.dataset.id = data.id;

            // Get member and class names from the select elements
            const memberSelect = document.getElementById('memberID');
            const classSelect = document.getElementById('classID');
            const memberName = memberSelect.options[memberSelect.selectedIndex].text;
            const classInfo = classSelect.options[classSelect.selectedIndex].text.split(' - ');
            const className = classInfo[0];
            const scheduleDay = classInfo[1];
            const scheduleTime = classInfo[2];

            newRow.innerHTML = `
                <td>${data.id}</td>
                <td>${memberName}</td>
                <td>${className}</td>
                <td>${scheduleDay}</td>
                <td>${scheduleTime}</td>
                <td>${formData.bookingDate}</td>
                <td>
                    <button onclick="editBooking('${data.id}')" class="edit-btn">Edit</button>
                    <button onclick="deleteBooking('${data.id}')" class="delete-btn">Cancel</button>
                </td>
            `;
            tbody.insertBefore(newRow, tbody.firstChild);

            // Reset the form
            addBookingForm.reset();

            // Remove success message after 5 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 5000);
        } else {
            // Handle multiple error cases
            if (data.error === 'Duplicate entries found' && data.duplicates) {
                data.duplicates.forEach(duplicate => {
                    if (duplicate.field === 'booking') {
                        notifications.error(`Member already booked for this class on ${formData.bookingDate}`);
                    }
                    if (duplicate.field === 'capacity') {
                        notifications.error(`Class is at maximum capacity`);
                    }
                });
            } else {
                notifications.error(`Failed to add booking: ${data.error}`);
            }
        }
    } catch (error) {
        console.error('Error details:', error);
        notifications.error(`Error adding booking: ${error.message}`);
    }
});

// Edit Booking
async function editBooking(id) {
    console.log('Editing booking:', id);
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (!row) {
        console.error('Row not found for id:', id);
        return;
    }
    const modal = document.getElementById('edit-modal');

    try {
        // Get the booking details from the server
        const response = await fetch(`${BASE_PATH}/api/class-bookings/${id}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch booking details');
        }

        // Fill the edit form with current data
        document.getElementById('edit-bookingID').value = id;

        // Set member name display
        const memberName = row.cells[1].textContent.trim();
        document.querySelector('.member-name-display').textContent = memberName;

        // Get class name from the row
        const className = row.cells[2].textContent.trim();
        const scheduleDay = row.cells[3].textContent.trim();
        const scheduleTime = row.cells[4].textContent.trim();
        const classSelect = document.getElementById('edit-classID');

        // Find and select the matching class option
        Array.from(classSelect.options).forEach(option => {
            const optionClass = option.text.split(' - ')[0].trim();
            const optionDay = option.text.split(' - ')[1].trim();
            const optionTime = option.text.split(' - ')[2].trim();
            if (optionClass === className && optionDay === scheduleDay && optionTime === scheduleTime) {
                option.selected = true;
            }
        });

        // Set and display booking date
        const bookingDate = row.cells[5].textContent;
        document.querySelector('.booking-date-display').textContent = bookingDate;

        modal.style.display = 'block';
    } catch (error) {
        console.error('Error fetching booking details:', error);
        notifications.error('Error loading booking details');
    }
}

// Update Booking
editBookingForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const id = document.getElementById('edit-bookingID').value;
    const row = document.querySelector(`tr[data-id="${id}"]`);

    // Get the memberID from the route
    const response = await fetch(`${BASE_PATH}/api/class-bookings/${id}`);
    const data = await response.json();
    const memberID = data.memberID;

    const formData = {
        memberID: memberID,
        classID: document.getElementById("edit-classID").value,
        bookingDate: row.cells[5].textContent // Keep original booking date
    };

    console.log('Updating booking with data:', formData);

    try {
        const response = await fetch(`${BASE_PATH}/api/class-bookings/${id}`, {
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
            const classSelect = document.getElementById('edit-classID');
            const classInfo = classSelect.options[classSelect.selectedIndex].text.split(' - ');
            row.cells[2].textContent = classInfo[0]; // Class name
            row.cells[3].textContent = classInfo[1]; // Schedule day
            row.cells[4].textContent = classInfo[2]; // Schedule time

            // Show success message for 5 seconds
            const successMessage = notifications.success('Booking updated successfully!');
            setTimeout(() => {
                successMessage.remove();
            }, 5000);
        } else {
            notifications.error(data.error || 'Failed to update booking');
        }
    } catch (error) {
        console.error('Error:', error);
        notifications.error('Error updating booking');
    }
});

// Delete Booking
async function deleteBooking(id) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        try {
            const response = await fetch(`${BASE_PATH}/api/class-bookings/${id}`, {
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
                const successMessage = notifications.success('Booking cancelled successfully!');
                setTimeout(() => {
                    successMessage.remove();
                }, 5000);
            } else {
                notifications.error(data.error || 'Failed to cancel booking');
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
