document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.getElementById("menu-toggle");
    const wrapper = document.getElementById("wrapper");

    if (menuToggle) {
        menuToggle.addEventListener("click", function (e) {
            e.preventDefault();
            wrapper.classList.toggle("toggled");
        });
    }

    // Check auth status on page load
    const token = localStorage.getItem('toolgostar_token');
    if (!token && !window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
    } else if (token && window.location.pathname.includes('login.html')) {
        window.location.href = 'index.html';
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    const logoutLink = document.getElementById('logout-link');

    const handleLogout = async () => {
        try {
            // Call logout API if available
            if (apiService && apiService.isAuthenticated()) {
                await apiService.logout();
            }
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            // Clear local storage and redirect
            localStorage.removeItem('toolgostar_token');
            localStorage.removeItem('toolgostar_user');
            localStorage.removeItem('authToken');
            window.location.href = 'login.html';
        }
    };

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    if (logoutLink) {
        logoutLink.addEventListener('click', handleLogout);
    }

    // Set user name in navbar
    const userNameSpan = document.getElementById('user-name');
    const user = JSON.parse(localStorage.getItem('toolgostar_user') || '{}');
    if (userNameSpan && user.firstName) {
        userNameSpan.textContent = `${user.firstName} ${user.lastName || ''}`.trim();
    }

    // Initialize API service with existing token
    if (apiService && token) {
        apiService.setToken(token);
    }
});
