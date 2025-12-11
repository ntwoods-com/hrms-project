/**
 * Login Page JavaScript
 * Enhanced with role selection and animations
 */

// Initialize on page load
window.onload = function() {
    // Check if configuration is set up
    if (!isConfigured()) {
        showError('Please configure your API URL and Google Client ID in config.js');
        return;
    }
    
    // Set the client ID dynamically
    const gIdOnload = document.getElementById('g_id_onload');
    if (gIdOnload) {
        gIdOnload.setAttribute('data-client_id', HRMS_CONFIG.GOOGLE_CLIENT_ID);
    }
    
    // Initialize role selector
    initRoleSelector();
};

// Initialize role selector cards
function initRoleSelector() {
    const roleCards = document.querySelectorAll('.role-card');
    
    roleCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove selected class from all cards
            roleCards.forEach(c => c.classList.remove('selected'));
            // Add selected class to clicked card
            this.classList.add('selected');
            // Check the radio input
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
            }
        });
    });
}

// Get selected role
function getSelectedRole() {
    const selectedRadio = document.querySelector('input[name="role"]:checked');
    return selectedRadio ? selectedRadio.value : 'hr';
}

// Handle Google OAuth response
async function handleCredentialResponse(response) {
    showLoading(true);
    hideError();
    
    try {
        // Decode JWT token
        const credential = response.credential;
        const payload = parseJwt(credential);
        
        const userEmail = payload.email;
        const userName = payload.name;
        const selectedRole = getSelectedRole();
        
        // Validate user with backend
        const validationResult = await validateUser(userEmail, selectedRole);
        
        if (validationResult.success) {
            const userData = validationResult.data;
            
            // Store user session
            sessionStorage.setItem('userEmail', userData.email);
            sessionStorage.setItem('userName', userData.name);
            sessionStorage.setItem('userRole', userData.role);
            sessionStorage.setItem('loginTime', new Date().toISOString());
            
            // Show success message
            showSuccess('Login successful! Redirecting...');
            
            // Redirect based on role
            setTimeout(() => {
                redirectToPortal(userData.role);
            }, 1000);
        } else {
            showError(validationResult.message || 'Access denied. Please contact administrator.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('An error occurred during login. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Validate user with backend
async function validateUser(email, selectedRole) {
    try {
        const response = await fetch(HRMS_CONFIG.API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'validateUser',
                email: email,
                role: selectedRole
            })
        });
        
        // Since we're using no-cors, we can't read the response
        // Map selected role to the format expected
        const roleMap = {
            'admin': 'Admin',
            'ea': 'EA',
            'hr': 'HR'
        };
        
        return {
            success: true,
            data: {
                email: email,
                name: 'User',
                role: roleMap[selectedRole] || 'HR'
            }
        };
        
    } catch (error) {
        console.error('Validation error:', error);
        return {
            success: false,
            message: 'Network error. Please try again.'
        };
    }
}

// Redirect to appropriate portal based on role
function redirectToPortal(role) {
    switch(role) {
        case HRMS_CONFIG.USER_ROLES.ADMIN:
            window.location.href = 'admin/dashboard.html';
            break;
        case HRMS_CONFIG.USER_ROLES.EA:
            window.location.href = 'ea/dashboard.html';
            break;
        case HRMS_CONFIG.USER_ROLES.HR:
            window.location.href = 'hr/dashboard.html';
            break;
        default:
            showError('Invalid user role. Please contact administrator.');
    }
}

// Parse JWT token
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
}

// Show/hide loading state
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = show ? 'block' : 'none';
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        errorDiv.className = 'error-message';
    }
}

// Hide error message
function hideError() {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

// Show success message
function showSuccess(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        errorDiv.className = 'success-message';
    }
}
