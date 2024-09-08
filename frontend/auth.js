let tempUsername = null;


const Auth = (function() {
    let authToken = null;
    let refreshToken = null;
    let currentUser = null;
    let authModal = null;
    let otpModal = null;
    let otpUsername = null;

    function init() {
        authToken = localStorage.getItem('authToken');
        refreshToken = localStorage.getItem('refreshToken');
        currentUser = localStorage.getItem('currentUser');
        if (refreshToken) {
            refreshAccessToken();
        }

        updateUI();
        
        initModals();
    }

    function initModals() {
        const authModalElement = document.getElementById('authModal');
        if (authModalElement) {
            authModal = new bootstrap.Modal(authModalElement, {
                backdrop: 'static',
                keyboard: false
            });
        }

        const otpModalElement = document.getElementById('otpModal');
        if (otpModalElement) {
            otpModal = new bootstrap.Modal(otpModalElement, {
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
            initModals();
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

    function showOtpModal() {
        // document.getElementById('otpUsername').value = tempUsername;
        if (!otpModal) {
            initModals();
        }
        if (otpModal) {
            otpModal.show();
        }
    }

    function hideOtpModal() {
        if (otpModal) {
            otpModal.hide();
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
                if (data.message === 'OTP has been sent to your registered email.') {
                    tempUsername = username;
                    // Rediriger vers la page de saisie de l'OTP ou afficher une modal
                    showOtpModal();
                    return;
                }
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

    async function verifyOtp(username, otp) {
        try {
            console.log("OTP dans verufyOTP = ");
            console.log(otp);
            console.log("Username dans verifyOTP = ");
            console.log(username);
            const response = await fetch('http://localhost:8000/api/verify-otp/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, otp }),
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
                hideOtpModal();
                hideAuthModal();
                updateUI();
                return true;
            } else {
                throw new Error('Invalid OTP');
            }
        } catch (error) {
            console.error('Error during OTP verification:', error);
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
        showOtpModal,
        hideOtpModal,
        signIn,
        signUp,
        verifyOtp,
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
            tempUsername = username;
            await Auth.signUp(username, email, password, enable_2FA);
            window.showTab('home');
        } catch (error) {
            alert('Error creating account. Please try again.');
        }
    });

    document.getElementById('otpForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const otpCode = document.getElementById('otpCode').value;
        const username = tempUsername;
        console.log("Submit not clicked yet\notp = ");
        console.log(otpCode);
        // const username = document.getElementById('otpUsername').value;
        console.log("Submit not clicked yet clicked\nusername = ");
        console.log(username);
        try {
            console.log("Submit clicked\notp = ");
            console.log(otpCode);
            console.log("Submit clicked\nusername = ");
            console.log(username);
            await Auth.verifyOtp(username, otpCode);
            window.showTab('home');
        } catch (error) {
            alert('Invalid OTP. Please try again.');
        }
    });

    document.getElementById('signOutBtn').addEventListener('click', () => {
        Auth.signOut();
    });

});
