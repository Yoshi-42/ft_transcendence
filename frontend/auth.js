const Auth = (function() {
    let authToken = null;
    let refreshToken = null;
    let currentUser = null;
    let authModal = null;

    function init() {
        authToken = localStorage.getItem('authToken');
        refreshToken = localStorage.getItem('refreshToken');
        currentUser = localStorage.getItem('currentUser');
        updateWelcomeMessage();
        
        // Initialize the modal
        authModal = new bootstrap.Modal(document.getElementById('authModal'), {
            backdrop: 'static',
            keyboard: false
        });
    }

    function isAuthenticated() {
        return !!authToken;
    }

    function showAuthModal() {
        if (authModal) {
            authModal.show();
        }
    }

    function hideAuthModal() {
        if (authModal && isAuthenticated()) {
            authModal.hide();
        }
    }

    function updateWelcomeMessage() {
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (currentUser) {
            welcomeMessage.textContent = `Welcome, ${currentUser}!`;
        } else {
            welcomeMessage.textContent = '';
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
                hideAuthModal();
                updateWelcomeMessage();
                return true;
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            console.error('Error during sign in:', error);
            throw error;
        }
    }

    async function signUp(username, email, password) {
        try {
            const response = await fetch('http://localhost:8000/api/signup/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                authToken = data.access;
                refreshToken = data.refresh;
                currentUser = username;
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('currentUser', currentUser);
                hideAuthModal();
                updateWelcomeMessage();
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
        updateWelcomeMessage();
        showAuthModal();
    }

    return {
        init,
        isAuthenticated,
        showAuthModal,
        hideAuthModal,
        signIn,
        signUp,
        signOut
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
        try {
            await Auth.signUp(username, email, password);
            window.showTab('home');
        } catch (error) {
            alert('Error creating account. Please try again.');
        }
    });
});