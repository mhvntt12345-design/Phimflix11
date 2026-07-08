document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in as admin
    const currentAdmin = db.getCurrentAdmin();
    if (currentAdmin && currentAdmin.role === 'admin') {
        window.location.href = 'admin.html';
    }
});

function handleAdminLogin(e) {
    e.preventDefault();
    const identifier = document.getElementById('loginUsername').value.trim().toLowerCase();
    const pass = document.getElementById('loginPassword').value;
    
    const users = db.getUsers();
    const foundUser = users.find(u => {
        const username = (u.username || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        return (username === identifier || email === identifier) && u.password === pass && u.role === 'admin';
    });
    
    if (foundUser) {
        // Save admin session
        db.setCurrentAdmin(foundUser);
        window.location.href = 'admin.html';
    } else {
        const errorEl = document.getElementById('loginError');
        errorEl.textContent = 'Tên đăng nhập, mật khẩu không đúng hoặc bạn không có quyền Admin!';
        errorEl.style.display = 'block';
    }
}
