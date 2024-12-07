// Get base path from meta tag
const BASE_PATH = document.querySelector('meta[name="base-path"]').content;

// Add event listener for form submission
document.getElementById('addTrainerEquipment').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Get form data
    const formData = {
        trainerID: document.getElementById('trainerID').value,
        equipmentID: document.getElementById('equipmentID').value,
        certificationDate: document.getElementById('certificationDate').value,
        expiryDate: document.getElementById('expiryDate').value
    };

    try {
        // Send POST request to API
        const response = await fetch(`${BASE_PATH}/api/trainer-equipment`, {
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
                        case 'active_certification':
                            return 'This trainer already has an active certification for this equipment';
                        default:
                            return `Error with ${err.field}: ${err.value}`;
                    }
                });
                alert(errors.join('\n'));
                return;
            }
            throw new Error(data.error || 'Failed to add certification');
        }

        // Refresh the page to show new certification
        window.location.reload();

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to add certification: ' + error.message);
    }
});

// Function to renew certification
async function renewCertification(certificationId) {
    const newExpiryDate = prompt('Enter new expiry date (YYYY-MM-DD):');
    if (!newExpiryDate) return;

    try {
        const response = await fetch(`${BASE_PATH}/api/trainer-equipment/${certificationId}/renew`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ expiryDate: newExpiryDate })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to renew certification');
        }

        // Refresh the page to show updated certification
        window.location.reload();

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to renew certification: ' + error.message);
    }
}

// Function to delete certification
async function deleteCertification(certificationId) {
    if (!confirm('Are you sure you want to delete this certification?')) {
        return;
    }

    try {
        const response = await fetch(`${BASE_PATH}/api/trainer-equipment/${certificationId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to delete certification');
        }

        // Refresh the page to show updated list
        window.location.reload();

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete certification: ' + error.message);
    }
}
