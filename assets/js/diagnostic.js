// =============================================
// HRMS OAuth Quick Diagnostic Tool
// Run this in browser console (F12) to debug
// =============================================

console.log('🔍 HRMS OAuth Diagnostic Starting...\n');

// 1. Check if config is loaded
console.log('1️⃣ Configuration Check:');
if (typeof HRMS_CONFIG !== 'undefined') {
    console.log('✅ Config loaded');
    console.log('   API_URL:', HRMS_CONFIG.API_URL);
    console.log('   Client ID:', HRMS_CONFIG.GOOGLE_CLIENT_ID);
} else {
    console.error('❌ Config NOT loaded - config.js may not be included');
}

// 2. Check HTML data attribute
console.log('\n2️⃣ HTML Attribute Check:');
const onloadDiv = document.getElementById('g_id_onload');
if (onloadDiv) {
    const clientId = onloadDiv.getAttribute('data-client_id');
    if (clientId && clientId !== '') {
        console.log('✅ data-client_id is set:', clientId);
        
        // Validate format
        if (clientId.includes('.apps.googleusercontent.com')) {
            console.log('✅ Client ID format looks correct');
        } else {
            console.error('❌ Client ID format looks wrong - should end with .apps.googleusercontent.com');
        }
    } else {
        console.error('❌ data-client_id is EMPTY - Check index.html');
    }
} else {
    console.error('❌ g_id_onload div NOT found');
}

// 3. Check Google Sign-In script
console.log('\n3️⃣ Google Script Check:');
if (window.google) {
    console.log('✅ Google Sign-In library loaded');
} else {
    console.error('❌ Google Sign-In library NOT loaded');
    console.log('   Check: <script src="https://accounts.google.com/gsi/client" async defer></script>');
}

// 4. Check current URL
console.log('\n4️⃣ Current URL Check:');
console.log('   Protocol:', window.location.protocol);
console.log('   Hostname:', window.location.hostname);
console.log('   Port:', window.location.port || '(default)');
console.log('   Full Origin:', window.location.origin);
console.log('\n   ⚠️ This EXACT URL must be in "Authorized JavaScript origins"');

// 5. Common issues check
console.log('\n5️⃣ Common Issues Check:');
const issues = [];

if (window.location.protocol === 'file:') {
    issues.push('❌ Running from file:// - Must use http:// or https://');
    issues.push('   Solution: Use Python HTTP Server or VS Code Live Server');
}

if (!onloadDiv || !onloadDiv.getAttribute('data-client_id')) {
    issues.push('❌ Client ID not set in HTML');
    issues.push('   Solution: Update index.html data-client_id attribute');
}

if (typeof HRMS_CONFIG === 'undefined') {
    issues.push('❌ Config not loaded');
    issues.push('   Solution: Ensure config.js is loaded before other scripts');
}

if (issues.length > 0) {
    console.error('\n🚨 Issues Found:');
    issues.forEach(issue => console.error(issue));
} else {
    console.log('✅ No obvious issues detected');
}

// 6. Next steps
console.log('\n6️⃣ Next Steps:');
console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
console.log('2. Click your OAuth Client ID');
console.log('3. Add to "Authorized JavaScript origins":', window.location.origin);
console.log('4. Click Save');
console.log('5. Wait 5 minutes ⏰');
console.log('6. Clear cache (Ctrl+Shift+Delete)');
console.log('7. Reload this page');
console.log('8. Try login again');

// 7. Test API connectivity
console.log('\n7️⃣ Testing API Connectivity...');
if (typeof HRMS_CONFIG !== 'undefined' && HRMS_CONFIG.API_URL) {
    fetch(HRMS_CONFIG.API_URL)
        .then(response => {
            console.log('✅ API is reachable');
            console.log('   Status:', response.status);
            return response.text();
        })
        .then(text => {
            if (text.includes('HRMS')) {
                console.log('✅ API response looks good');
            } else {
                console.warn('⚠️ API response unexpected:', text.substring(0, 100));
            }
        })
        .catch(error => {
            console.error('❌ API is NOT reachable:', error.message);
            console.log('   Check: Is Google Apps Script deployed as Web App?');
        });
}

console.log('\n✅ Diagnostic Complete! Check results above.');
console.log('📘 For detailed guide, see: OAUTH_TROUBLESHOOTING.md');
