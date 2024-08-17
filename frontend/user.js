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
                    <button type="submit" class="btn btn-primary">Update Profile</button>
                </form>
            </div>
            <div class="col-md-6">
                <h3>Stats</h3>
                <ul class="list-group">
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        Games Played
                        <span class="badge bg-primary rounded-pill">14</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        Wins
                        <span class="badge bg-success rounded-pill">8</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        Losses
                        <span class="badge bg-danger rounded-pill">6</span>
                    </li>
                </ul>
            </div>
        </div>
    `;

    document.getElementById('userForm').addEventListener('submit', updateProfile);
}

function updateProfile(event) {
    event.preventDefault();
    const form = event.target;
    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
    }

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    console.log(`Updating profile... Username: ${username}, Email: ${email}`);
    // Here you would typically send this data to your server

    // Show a success message
    const alert = document.createElement('div');
    alert.className = 'alert alert-success mt-3';
    alert.role = 'alert';
    alert.textContent = 'Profile updated successfully!';
    form.appendChild(alert);

    // Remove the alert after 3 seconds
    setTimeout(() => alert.remove(), 3000);
}