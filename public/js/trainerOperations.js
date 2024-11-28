// DOM Elements
const addTrainerForm = document.getElementById('add-trainer-form');
const trainersTable = document.getElementById('trainers-table');

// Add Trainer
addTrainerForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log('Form submitted');

    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        hireDate: document.getElementById('hireDate').value,
        specialization: document.getElementById('specialization').value
    };

    try {
        const response = await fetch(`${BASE_PATH}/api/trainers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            location.reload();
        } else {
            const data = await response.json();
            console.error('Error:', data.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}); 