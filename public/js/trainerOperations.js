// Get BASE_PATH from meta tag
const BASE_PATH = document.querySelector('meta[name="base-path"]').content;
console.log('BASE_PATH:', BASE_PATH);  // Add this

// DOM Elements
const addTrainerForm = document.getElementById('addTrainer');
console.log('Form element found:', addTrainerForm);  // Verify form is found

// Add Trainer
addTrainerForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log('Form submitted');  // Verify event listener is working

    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        specialization: document.getElementById('specialization').value,
        hireDate: document.getElementById('hireDate').value
    };
    console.log('Form data:', formData);  // Check data being sent

    try {
        console.log('Making fetch request to:', `${BASE_PATH}/api/trainers`);
        const response = await fetch(`${BASE_PATH}/api/trainers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        console.log('Response received:', response);

        if (response.ok) {
            location.reload();
        } else {
            const data = await response.json();
            console.error('Error response:', data);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}); 