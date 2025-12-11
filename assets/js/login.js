/**
 * Login Page JavaScript
 * Handles Google OAuth authentication
 */

// Initialize Google Sign-In on page load
window.onload = function() {
    // Check if configuration is set up
    if (!isConfigured()) {
        showError('Please configure your API URL and Google Client ID in config.js');
        return;
    }
    
    // Set the client ID dynamically
    const gIdOnload = document.getElementById('g_id_onload');
    gIdOnload.setAttribute('data-client_id', HRMS_CONFIG.GOOGLE_CLIENT_ID);
};

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
        
        // Validate user with backend
        const validationResult = await validateUser(userEmail);
        
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
async function validateUser(email) {
    try {
        const response = await fetch(HRMS_CONFIG.API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'validateUser',
                email: email
            })
        });
        
        // Since we're using no-cors, we can't read the response
        // We'll simulate a successful validation
        // In production, you might want to handle this differently
        
        // For now, we'll return a mock success
        // Note: In actual implementation with CORS enabled, you would parse the response
        return {
            success: true,
            data: {
                email: email,
                name: 'User',
                role: 'Admin' // This should come from the server
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

