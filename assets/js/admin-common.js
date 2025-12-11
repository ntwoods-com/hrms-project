/**
 * Admin Common Functions
 * Shared across all admin pages
 */

// Check admin authentication
function checkAdminAuth() {
    const user = checkAuth();
    
    if (!user) {
        return;
    }
    
    if (user.role !== HRMS_CONFIG.USER_ROLES.ADMIN) {
        alert('Access denied. Admin privileges required.');
        window.location.href = '../index.html';
        return;
    }
    
    // Update user info in sidebar
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const userAvatar = document.getElementById('userAvatar');
    
    if (userName) userName.textContent = user.name;
    if (userRole) userRole.textContent = user.role;
    if (userAvatar) userAvatar.textContent = user.name.charAt(0).toUpperCase();
    
    return user;
}

// Initialize sidebar toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
            sidebarOverlay.classList.toggle('active');
        });
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function() {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
        });
    }
    
    // Set active menu item
    setActiveMenuItem();
});

// Set active menu item based on current page
function setActiveMenuItem() {
    const currentPage = window.location.pathname.split('/').pop();
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === currentPage) {
            item.classList.add('active');
        }
    });
}

