function initUser() {
    const userTab = document.getElementById('user');
    userTab.innerHTML = `
        <h1 class="display-4">User Profile</h1>
        <p class="lead">View and edit your user profile here.</p>
        <div class="row mt-4">
            <div class="col-md-6">
                <form id="userForm" class="needs-validation" novalidate>
                    <div class="mb-3">
                        <label for="username" class="form-label">Username</label>
                        <input type="text" class="form-control" id="username" name="username" required>
                        <div class="invalid-feedback">
                            Please choose a username.
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" class="form-control" id="email" name="email" required>
                        <div class="invalid-feedback">
                            Please provide a valid email.
                        </div>
                    </div>
                    <div class="mb-3 form-check">
                        <label class="form-check-label" for="enable2FA">Enable 2FA</label>
                        <input type="checkbox" class="form-check-input" id="enable_2fa">
                    </div>
                    <button type="submit" class="btn btn-primary">Update Profile</button>
                </form>
                <div id="updateMessage" class="mt-3"></div>
            </div>
            <div class="col-md-6">
                <h3>Stats</h3>
                <ul class="list-group">
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        Games Played
                        <span class="badge bg-primary rounded-pill" id="gamesPlayed">0</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        Wins
                        <span class="badge bg-success rounded-pill" id="wins">0</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        Losses
                        <span class="badge bg-danger rounded-pill" id="losses">0</span>
                    </li>
                </ul>
            </div>
        </div>
    `;

    loadUserInfo();
    document.getElementById('userForm').addEventListener('submit', updateProfile);
}

async function loadUserInfo() {
    try {
        const response = await fetch('http://localhost:8000/api/user/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const userData = await response.json();
            console.log('User data received:', userData);  // Log the received data
            document.getElementById('username').value = userData.username;
            document.getElementById('email').value = userData.email;
            document.getElementById('gamesPlayed').textContent = userData.games_played || '0';
            document.getElementById('wins').textContent = userData.wins || '0';
            document.getElementById('losses').textContent = userData.losses || '0';
            document.getElementById('enable_2fa').checked = userData.enable_2fa;
        } else {
            throw new Error('Failed to load user data');
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        showUpdateMessage('Failed to load user data. Please try again.', 'danger');
    }
}

async function updateProfile(event) {
    event.preventDefault();
    const form = event.target;
    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
    }

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const enable_2fa = document.getElementById('enable_2fa').checked;

    try {
        const response = await fetch('http://localhost:8000/api/user/update/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, enable_2fa }),
        });

        if (response.ok) {
            showUpdateMessage('Profile updated successfully!', 'success');
            loadUserInfo();  // Reload user info after successful update
        } else {
            throw new Error('Failed to update profile');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showUpdateMessage('Failed to update profile. Please try again.', 'danger');
    }
}

function showUpdateMessage(message, type) {
    const messageElement = document.getElementById('updateMessage');
    messageElement.innerHTML = `<div class="alert alert-${type}" role="alert">${message}</div>`;
    setTimeout(() => {
        messageElement.innerHTML = '';
    }, 5000);
}

// Make initUser available globally
window.initUser = initUser;