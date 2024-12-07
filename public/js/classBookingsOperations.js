// DOM Elements
const addBookingForm = document.getElementById('addBooking');
const editBookingForm = document.getElementById('edit-booking-form');
const bookingsTable = document.getElementById('bookings-table');

// Get BASE_PATH from meta tag
const BASE_PATH = document.querySelector('meta[name="base-path"]').content;
console.log('BASE_PATH:', BASE_PATH);

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

            // Add the new booking to the table immediately using the server response
            const tbody = bookingsTable.querySelector('tbody');
            const newRow = document.createElement('tr');
            const booking = data.booking;
            newRow.dataset.id = data.id;
            newRow.dataset.memberId = booking.memberID;
            newRow.dataset.classId = booking.classID;

            newRow.innerHTML = `
                <td>${data.id}</td>
                <td>${booking.memberName}</td>
                <td>${booking.className}</td>
                <td>${booking.scheduleDay}</td>
                <td>${booking.scheduleTime}</td>
                <td>${booking.bookingDate}</td>
                <td>
                    <button onclick="editBooking(${data.id})" class="edit-btn">Edit</button>
                    <button onclick="deleteBooking(${data.id})" class="delete-btn">Delete</button>
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

// Make editBooking function globally available
window.editBooking = function (id) {
    console.log('editBooking called with id:', id);
    console.log('Looking for row with data-id:', id);

    const row = document.querySelector(`tr[data-id="${id}"]`);
    console.log('Found row:', row);

    if (!row) {
        console.error('Row not found for id:', id);
        return;
    }

    const modal = document.getElementById('edit-modal');
    console.log('Found modal:', modal);

    // Fill the edit form with current data
    document.getElementById('edit-bookingID').value = id;
    document.getElementById('edit-memberID').value = row.dataset.memberId;
    console.log('Set memberID:', row.dataset.memberId);

    // Set member name display
    const memberName = row.cells[1].textContent.trim();
    const memberNameDisplay = document.querySelector('.member-name-display');
    memberNameDisplay.textContent = memberName;
    console.log('Set member name display:', memberName);

    // Get class name from the row
    const className = row.cells[2].textContent.trim();
    const scheduleDay = row.cells[3].textContent.trim();
    const scheduleTime = row.cells[4].textContent.trim();
    const classSelect = document.getElementById('edit-classID');
    console.log('Class details:', { className, scheduleDay, scheduleTime });

    // Find and select the matching class option
    Array.from(classSelect.options).forEach(option => {
        const optionInfo = option.text.split(' - ');
        const optionClass = optionInfo[0].trim();
        const optionDay = optionInfo[1].trim();
        const optionTime = optionInfo[2].trim();
        console.log('Comparing option:', { optionClass, optionDay, optionTime });
        if (optionClass === className && optionDay === scheduleDay && optionTime === scheduleTime) {
            option.selected = true;
            console.log('Selected matching option');
        }
    });

    // Set and display booking date
    const bookingDate = row.cells[5].textContent;
    document.querySelector('.booking-date-display').textContent = bookingDate;
    console.log('Set booking date display:', bookingDate);

    modal.style.display = 'block';
    console.log('Displayed modal');
};

// Update Booking
editBookingForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    console.log('Edit form submitted');

    const id = document.getElementById('edit-bookingID').value;
    console.log('Editing booking ID:', id);

    const row = document.querySelector(`tr[data-id="${id}"]`);
    console.log('Found row for update:', row);

    const formData = {
        memberID: document.getElementById('edit-memberID').value,
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

            // Update the row with the server response data
            const booking = data.booking;
            row.cells[2].textContent = booking.className;
            row.cells[3].textContent = booking.scheduleDay;
            row.cells[4].textContent = booking.scheduleTime;

            // Update data attributes
            row.dataset.classId = formData.classID;

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

// Make deleteBooking function globally available
window.deleteBooking = function (id) {
    console.log('deleteBooking called with id:', id);

    if (confirm('Are you sure you want to delete this booking?')) {
        fetch(`${BASE_PATH}/api/class-bookings/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log('Delete response:', data);

                if (data.message) {
                    // Remove the row from the table immediately
                    const row = document.querySelector(`tr[data-id="${id}"]`);
                    console.log('Found row to delete:', row);

                    if (row) {
                        row.style.transition = 'opacity 0.3s ease';
                        row.style.opacity = '0';
                        setTimeout(() => {
                            row.remove();
                            console.log('Row removed');
                        }, 300);
                    }

                    // Show success message for 5 seconds
                    const successMessage = notifications.success('Booking deleted successfully!');
                    setTimeout(() => {
                        successMessage.remove();
                    }, 5000);
                } else {
                    notifications.error(data.error || 'Failed to delete booking');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                notifications.error('Error connecting to server');
            });
    }
};

// Modal functions
window.closeEditModal = function () {
    console.log('Closing modal');
    const modal = document.getElementById('edit-modal');
    modal.style.display = 'none';
};

// Close modal if clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('edit-modal');
    if (event.target == modal) {
        console.log('Clicked outside modal');
        modal.style.display = 'none';
    }
};

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
    console.log('Found edit form:', editBookingForm);
    console.log('Found bookings table:', bookingsTable);
});
