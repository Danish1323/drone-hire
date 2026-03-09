/**
 * auth.js | DroneHire | Neo-Brutalist Authentication Validation
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- Check if already logged in -> redirect ---
    const currentUser = JSON.parse(localStorage.getItem('dronehire_current_user'));
    if (currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // --- DOM Elements ---
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');
    const generalError = document.getElementById('generalError');
    const generalErrorText = document.getElementById('generalErrorText');

    // --- Helper to toggle tabs ---
    window.switchAuthTab = function(tabName) {
        generalError.style.display = 'none';

        if(tabName === 'login') {
            tabLogin.classList.add('active');
            tabRegister.classList.remove('active');
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        } else {
            tabRegister.classList.add('active');
            tabLogin.classList.remove('active');
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
        }
    };

    // --- Helper to get existing users ---
    const getUsers = () => {
        const users = localStorage.getItem('dronehire_users');
        return users ? JSON.parse(users) : [];
    };

    function showError(msg) {
        generalErrorText.textContent = msg;
        generalError.style.display = 'block';
    }

    function showSuccess(msg) {
        generalError.style.backgroundColor = 'var(--success)';
        generalError.style.borderColor = 'var(--success)';
        generalErrorText.textContent = msg;
        generalError.style.display = 'block';
    }

    // --- Handle Registration ---
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim().toLowerCase();
        const password = document.getElementById('regPassword').value;

        const users = getUsers();

        // Check if email exists
        if (users.find(u => u.email === email)) {
            showError("IDENTITY COLLISION: EMAIL ALREADY REGISTERED.");
            return;
        }

        // Add user
        users.push({ name, email, password });
        localStorage.setItem('dronehire_users', JSON.stringify(users));

        showSuccess("IDENTITY GENERATED. REROUTING TO INITIALIZATION...");
        registerForm.reset();
        
        setTimeout(() => {
            switchAuthTab('login');
            document.getElementById('loginEmail').value = email;
            generalError.style.display = 'none';
        }, 1500);
    });

    // --- Handle Login ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim().toLowerCase();
        const password = document.getElementById('loginPassword').value;

        const users = getUsers();
        const validUser = users.find(u => u.email === email && u.password === password);

        if (validUser) {
            // Store active session
            localStorage.setItem('dronehire_current_user', JSON.stringify({
                name: validUser.name,
                email: validUser.email
            }));

            showSuccess("ACCESS GRANTED. INITIALIZING TERMINAL...");

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 800);
        } else {
            // If they happen to use the hardcoded default account created in early iterations:
            if(email === 'admin@dronehire.com' && password === 'admin123') {
                 localStorage.setItem('dronehire_current_user', JSON.stringify({
                    name: 'System Admin',
                    email: email
                }));
                showSuccess("OVERRIDE ACCEPTED. INITIALIZING...");
                setTimeout(() => window.location.href = 'index.html', 800);
            } else {
                showError("ACCESS DENIED: INVALID CREDENTIALS.");
            }
        }
    });
});
