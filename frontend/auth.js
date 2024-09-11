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
        updateUI();
        
        initModal();
    }

    function initModal() {
        const modalElement = document.getElementById('authModal');
        console.log("Initation de la modale et test du log")
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

    // async function oauthSignUP()
    // {
    //     const response = await fetch('http://localhost:8000/api/42/login/', {
    //         method: 'GET',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         }
    //     });
    //     console.log(response);
    //     if (response.ok)
    //     {
    //         console.log("OK CHEPAKOI");
    //         return;
    //     }
    //     else
    //         console.log("crot");

    // }

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

    async function oauthSignUP() {
    window.location.href = 'http://localhost:8000/api/42/login/';
}

async function handleOAuthCallback(code) {
    try {
        console.log("DEbut de la fonction handleoauthcallback")
        const response = await fetch('http://localhost:8000/api/42/callback/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: code }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('authToken', data.access);
            localStorage.setItem('refreshToken', data.refresh);
            currentUser = data.username;
            localStorage.setItem('currentUser', currentUser);
            console.log('Access token:', data.access);
            console.log('Refresh token:', data.refresh);
            console.log('Username:', data.username);

            hideAuthModal();
            window.location.href = '/api/user_detail/'
            // Redirection ou mise à jour de l'interface utilisateur ici
        } else {
            console.log("Response pas ok du tout du tout")
            throw new Error('Failed to authenticate');
        }
    } catch (error) {
        console.error('Error during OAuth callback:', error);
    }
}


    return {
        init,
        isAuthenticated,
        showAuthModal,
        hideAuthModal,
        signIn,
        signUp,
        signOut,
        redirectToRoot,
        oauthSignUP,
        handleOAuthCallback,
    };

})();

// Set up event listeners for auth forms
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
        Auth.handleOAuthCallback(code);
    }

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


    document.getElementById('oauth42Button').addEventListener('click', () => {
        Auth.oauthSignUP();
    });
    
});