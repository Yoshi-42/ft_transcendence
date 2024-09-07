// auth.js

const Auth = (function() {
    let authToken = null;
    let refreshToken = null;
    let currentUser = null;
    let authModal = null;

    function init() {
        authToken = localStorage.getItem('authToken');
        refreshToken = localStorage.getItem('refreshToken');
        currentUser = localStorage.getItem('currentUser');
        if (refreshToken) {
            refreshAccessToken();
        }

        updateUI();
        
        initModal();
    }

    function initModal() {
        const modalElement = document.getElementById('authModal');
        if (modalElement) {
            authModal = new bootstrap.Modal(modalElement, {
                backdrop: 'static',
                keyboard: false
            });
        }
    }

    function isAuthenticated() {
        return !!authToken;
    }

    function showAuthModal() {
        if (!authModal) {
            initModal();
        }
        if (authModal) {
            authModal.show();
        }
    }

    function hideAuthModal() {
        if (authModal) {
            authModal.hide();
        }
    }

    function updateUI() {
        const welcomeMessage = document.getElementById('welcomeMessage');
        const signOutBtn = document.getElementById('signOutBtn');
        if (currentUser) {
            welcomeMessage.textContent = `Welcome, ${currentUser}!`;
            signOutBtn.style.display = 'inline-block';
        } else {
            welcomeMessage.textContent = '';
            signOutBtn.style.display = 'none';
        }
    }

    async function refreshAccessToken() {
    try {
        const response = await fetch('http://localhost:8000/api/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (response.ok) {
            const data = await response.json();
            authToken = data.access;
            localStorage.setItem('authToken', authToken);
            console.log('New Access token:', authToken);  // Log the new access token
            return authToken;
        } else {
            throw new Error('Failed to refresh token');
        }
    } catch (error) {
        console.error('Error refreshing token:', error);
        signOut(); // Déconnexion si le refresh échoue
        return null;
    }
}

async function getProtectedData() {
    // Rafraîchir le token si nécessaire
    if (!authToken) {
        authToken = await refreshAccessToken();
        if (!authToken) {
            return; // Sortir si le token n'a pas pu être rafraîchi
        }
    }

    try {
        const response = await fetch('http://localhost:8000/api/protected/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,  // Inclure le token JWT
            },
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Protected data:', data);
        } else {
            // Si la réponse est 401 (Unauthorized), essayer de rafraîchir le token
            if (response.status === 401) {
                authToken = await refreshAccessToken();
                if (authToken) {
                    return await getProtectedData(); // Réessayer avec le nouveau token
                }
            } else {
                throw new Error('Failed to fetch protected data');
            }
        }
    } catch (error) {
        console.error('Error fetching protected data:', error);
    }
}


    async function signIn(username, password) {
        try {
            const response = await fetch('http://localhost:8000/api/signin/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                authToken = data.access;
                refreshToken = data.refresh;
                currentUser = username;
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('currentUser', currentUser);
                console.log('Access token:', authToken);  // Log the access token
                console.log('Refresh token:', refreshToken);  // Log the refresh token
                hideAuthModal();
                updateUI();
                return true;
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            console.error('Error during sign in:', error);
            throw error;
        }
    }

    async function signUp(username, email, password, enable_2fa) {
        try {
            const response = await fetch('http://localhost:8000/api/signup/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password, enable_2fa }),
            });

            if (response.ok) {
                const data = await response.json();
                authToken = data.access;
                refreshToken = data.refresh;
                currentUser = username;
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('currentUser', currentUser);
                console.log('Access token:', authToken);  // Log the access token
                console.log('Refresh token:', refreshToken);  // Log the refresh token
                hideAuthModal();
                updateUI();
                return true;
            } else {
                throw new Error('Error creating account');
            }
        } catch (error) {
            console.error('Error during sign up:', error);
            throw error;
        }
    }

    function signOut() {
        authToken = null;
        refreshToken = null;
        currentUser = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');
        updateUI();
        
        // Redirect to web root
        redirectToRoot();
    }

    function redirectToRoot() {
        window.location.href = '/';
    }

    return {
        init,
        isAuthenticated,
        showAuthModal,
        hideAuthModal,
        signIn,
        signUp,
        signOut,
        redirectToRoot
    };
})();

// Set up event listeners for auth forms
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();

    document.getElementById('signinForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('signinUsername').value;
        const password = document.getElementById('signinPassword').value;
        try {
            await Auth.signIn(username, password);
            window.showTab('home');
        } catch (error) {
            alert('Invalid credentials. Please try again.');
        }
    });

    document.getElementById('signupForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('signupUsername').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const enable_2FA = document.getElementById('enable2FA').checked;
        try {
            await Auth.signUp(username, email, password, enable_2FA);
            window.showTab('home');
        } catch (error) {
            alert('Error creating account. Please try again.');
        }
    });
});