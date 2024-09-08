


	function showOtpModal(username) {
        // Assigner le nom d'utilisateur à un champ caché
        document.getElementById('otpUsername').value = username;
        // Afficher la modal OTP en utilisant Bootstrap
        var otpModal = new bootstrap.Modal(document.getElementById('otpModal'));
        otpModal.show();
    	}

	async function verifyOtp() {
        const username = document.getElementById('otpUsername').value;
        const otpCode = document.getElementById('otpCode').value;
        try {
            const response = await fetch('http://localhost:8000/api/verify-otp/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, otp: otpCode }),
            });

            if (response.ok) {
                const data = await response.json();
                const authToken = data.access;
                const refreshToken = data.refresh;
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('currentUser', username);
                console.log('Access token:', authToken);  // Log the access token
                console.log('Refresh token:', refreshToken);  // Log the refresh token
                document.getElementById('otpModal').style.display = 'none';
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