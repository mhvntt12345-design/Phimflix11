// js/profile.js

document.addEventListener('DOMContentLoaded', () => {
    // Check Auth
    const currentUser = db.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'auth.html';
        return;
    }

    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    const html = document.documentElement;
    const icon = themeToggle.querySelector('i');
    const savedTheme = localStorage.getItem('pf_theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    icon.className = savedTheme === 'dark' ? 'bx bx-sun' : 'bx bx-moon';

    themeToggle.addEventListener('click', () => {
        const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('pf_theme', newTheme);
        icon.className = newTheme === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
    });

    // Load User Info
    document.getElementById('userName').textContent = currentUser.displayName;
    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('settingName').value = currentUser.displayName;
    document.getElementById('settingEmail').value = currentUser.email;
    
    // Set Avatar (First letter of name)
    const displayName = currentUser.displayName || currentUser.username || '?';
    const initial = displayName.charAt(0).toUpperCase();
    document.getElementById('userAvatar').textContent = initial;

    // Tab Switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            // Add active class to clicked
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Logout
    document.getElementById('btnLogout').addEventListener('click', () => {
        if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            db.setCurrentUser(null);
            window.location.href = 'index.html';
        }
    });
});
