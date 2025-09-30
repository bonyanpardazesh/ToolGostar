document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    const errorMessage = document.getElementById("error-message");
    const loginBtnText = document.getElementById("login-btn-text");
    const loginSpinner = document.getElementById("login-spinner");

    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            // Show spinner and disable button
            loginBtnText.classList.add("d-none");
            loginSpinner.classList.remove("d-none");
            loginForm.querySelector('button').disabled = true;

            try {
                console.log('Attempting login with:', email);
                const result = await apiService.login(email, password);
                console.log('Login result:', result);
                console.log('Result success:', result?.success);
                console.log('Result data:', result?.data);

                if (result && result.success) {
                    // Store user data in localStorage for compatibility
                    localStorage.setItem('toolgostar_token', result.data.token);
                    localStorage.setItem('toolgostar_user', JSON.stringify(result.data.user));
                    
                    // Show success message
                    showSuccess('Login successful! Redirecting...');
                    
                    // Redirect after a short delay
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                } else {
                    showError(result.error?.message || 'Login failed. Please try again.');
                }
            } catch (error) {
                console.error('Login error:', error);
                showError('Network error. Please check your connection and try again.');
            } finally {
                // Hide spinner and enable button
                loginBtnText.classList.remove("d-none");
                loginSpinner.classList.add("d-none");
                loginForm.querySelector('button').disabled = false;
            }
        });
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.className = 'alert alert-danger';
        errorMessage.classList.remove('d-none');
    }

    function showSuccess(message) {
        errorMessage.textContent = message;
        errorMessage.className = 'alert alert-success';
        errorMessage.classList.remove('d-none');
    }
});
