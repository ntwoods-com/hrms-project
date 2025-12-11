// EA Common Functions
// This file contains shared functions for EA portal pages

// Check authentication and permissions
function checkAuth() {
    const session = sessionStorage.getItem('hrms_session');
    if (!session) {
        window.location.href = '../index.html';
        return;
    }

    const userData = JSON.parse(session);
    if (userData.role !== 'EA' && userData.role !== 'Admin') {
        alert('Access denied. You do not have permission to access this page.');
        window.location.href = '../index.html';
        return;
    }

    // Set user info in header
    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
        userNameEl.textContent = userData.name;
    }

    const roleEl = document.getElementById('userRole');
    if (roleEl) {
        roleEl.textContent = userData.role;
    }

    return userData;
}

// Get current user data
function getCurrentUser() {
    const session = sessionStorage.getItem('hrms_session');
    return session ? JSON.parse(session) : null;
}

// Logout function
function logout() {
    sessionStorage.removeItem('hrms_session');
    window.location.href = '../index.html';
}

// Toggle sidebar
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }
});

// Load job templates for auto-fill
async function loadTemplates() {
    try {
        const response = await apiCall('getTemplates', {});
        return response.templates || [];
    } catch (error) {
        console.error('Error loading templates:', error);
        return [];
    }
}

// Get template by job role
async function getTemplateByRole(jobRole) {
    const templates = await loadTemplates();
    return templates.find(t => t.jobRole === jobRole);
}

// Auto-fill form from template
async function autoFillFromTemplate(jobRole) {
    const template = await getTemplateByRole(jobRole);
    if (!template) {
        showToast('No template found for this job role', 'warning');
        return;
    }

    // Fill form fields
    const fields = {
        'responsibilities': template.responsibilities,
        'mustHave': template.mustHave,
        'shift': template.shift,
        'payScale': template.payScale,
        'perks': template.perks
    };

    Object.keys(fields).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && fields[fieldId]) {
            field.value = fields[fieldId];
        }
    });

    showToast('Template loaded successfully', 'success');
}

// Validate requirement form
function validateRequirementForm(formData) {
    const required = ['jobRole', 'responsibilities', 'mustHave', 'shift', 'payScale', 'perks'];
    
    for (let field of required) {
        if (!formData[field] || formData[field].trim() === '') {
            showToast(`Please fill ${field.replace(/([A-Z])/g, ' $1').trim()}`, 'error');
            return false;
        }
    }

    return true;
}

// Format requirement data for submission
function formatRequirementData(formData) {
    const user = getCurrentUser();
    return {
        jobTitle: `${formData.jobRole} - ${CONFIG.COMPANY_NAME}`,
        jobRole: formData.jobRole,
        responsibilities: formData.responsibilities,
        mustHave: formData.mustHave,
        shift: formData.shift,
        payScale: formData.payScale,
        perks: formData.perks,
        note: formData.note || '',
        raisedBy: user.email
    };
}

// Get requirement status badge class
function getRequirementStatusClass(status) {
    const statusClasses = {
        'Pending': 'badge-warning',
        'In Review': 'badge-info',
        'Valid': 'badge-success',
        'Incomplete': 'badge-danger',
        'Closed': 'badge-secondary'
    };
    return statusClasses[status] || 'badge-secondary';
}

// Get job role badge class
function getJobRoleBadgeClass(role) {
    const roleClasses = {
        'CRM': 'badge-primary',
        'CCE': 'badge-info',
        'PC': 'badge-success',
        'MIS': 'badge-warning',
        'Jr. Accountant': 'badge-purple',
        'Sr. Accountant': 'badge-purple'
    };
    return roleClasses[role] || 'badge-primary';
}

// Populate job role dropdown
function populateJobRoleDropdown(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = '<option value="">Select Job Role</option>' +
        CONFIG.JOB_ROLES.map(role => `<option value="${role}">${role}</option>`).join('');
}

// Generate job description text
function generateJobDescription(requirement) {
    return `
Job Title: ${requirement.jobTitle}

Company: ${CONFIG.COMPANY_NAME}
Location: ${CONFIG.INTERVIEW_LOCATION}

Job Responsibilities:
${requirement.responsibilities}

Must Have Skills:
${requirement.mustHave}

Shift Timing: ${requirement.shift}

Pay Scale: ${requirement.payScale}

Perks & Benefits:
${requirement.perks}

Interested candidates can apply with their updated CV.
    `.trim();
}

// Copy text to clipboard
function copyToClipboard(text, message = 'Copied to clipboard!') {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(message, 'success');
        }).catch(err => {
            console.error('Failed to copy:', err);
            showToast('Failed to copy', 'error');
        });
    } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showToast(message, 'success');
        } catch (err) {
            console.error('Failed to copy:', err);
            showToast('Failed to copy', 'error');
        }
        document.body.removeChild(textarea);
    }
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

// Parse pay scale string (e.g., "15000-18000")
function parsePayScale(payScaleString) {
    const parts = payScaleString.split('-').map(p => parseInt(p.trim()));
    return {
        min: parts[0] || 0,
        max: parts[1] || parts[0] || 0
    };
}

// Get requirements count by status
function getRequirementsCountByStatus(requirements) {
    return requirements.reduce((acc, req) => {
        acc[req.status] = (acc[req.status] || 0) + 1;
        return acc;
    }, {});
}

// Filter requirements by date range
function filterRequirementsByDateRange(requirements, startDate, endDate) {
    return requirements.filter(req => {
        const reqDate = new Date(req.raisedDate);
        return reqDate >= startDate && reqDate <= endDate;
    });
}

// Export requirements to CSV
function exportRequirementsCSV(requirements, filename = 'requirements.csv') {
    const headers = ['Req ID', 'Job Title', 'Role', 'Raised By', 'Raised Date', 'Status', 'HR Remark'];
    const rows = requirements.map(req => [
        req.reqId,
        req.jobTitle,
        req.jobRole,
        req.raisedBy,
        formatDate(req.raisedDate),
        req.status,
        req.hrRemark || ''
    ]);

    downloadCSV([headers, ...rows], filename);
}

// Validate email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone number (10 digits)
function isValidPhone(phone) {
    const re = /^[6-9]\d{9}$/;
    return re.test(phone);
}

// Get relative time (e.g., "2 days ago")
function getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(dateString);
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize tooltips (if needed)
function initializeTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const tooltipText = e.target.getAttribute('data-tooltip');
            // Show tooltip (implement your tooltip logic)
        });
    });
}

console.log('EA Common JS loaded');

