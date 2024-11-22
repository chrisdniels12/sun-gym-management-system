// Class management client-side logic
const classForm = document.getElementById('add-class-form');
const classTable = document.getElementById('class-table');

// Form validation
function validateClassData(data) {
    const errors = [];
    if (!data.className?.trim()) errors.push('Class name required');
    if (!data.trainerID) errors.push('Trainer required');
    if (!data.scheduleTime) errors.push('Schedule time required');
    if (!data.maxCapacity || data.maxCapacity < 1) errors.push('Valid capacity required');
    return errors;
}

// Add new class
classForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
        className: document.getElementById('input-class-name').value,
        trainerID: document.getElementById('input-trainer').value,
        scheduleTime: document.getElementById('input-time').value,
        scheduleDay: document.getElementById('input-day').value,
        maxCapacity: document.getElementById('input-capacity').value
    };

    const errors = validateClassData(formData);
    if (errors.length > 0) {
        showAlert(errors.join(', '), 'error');
        return;
    }

    try {
        const response = await fetch('/api/classes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const newClass = await response.json();
            addClassToTable(newClass);
            classForm.reset();
            showAlert('Class added successfully', 'success');
        }
    } catch (error) {
        showAlert('Error adding class', 'error');
    }
}); 