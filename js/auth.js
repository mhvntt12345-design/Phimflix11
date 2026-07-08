// js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    const currentUser = db.getCurrentUser();
    if (currentUser) {
        window.location.href = 'index.html';
    }
});

function toggleForm(formId) {
    document.querySelectorAll('.form-box').forEach(el => {
        el.classList.remove('active');
    });
    document.getElementById(formId).classList.add('active');
    
    // Clear errors
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('registerError').style.display = 'none';
}

function handleLogin(e) {
    e.preventDefault();
    const identifier = document.getElementById('loginUsername').value.trim().toLowerCase();
    const pass = document.getElementById('loginPassword').value;
    
    const users = db.getUsers();
    const foundUser = users.find(u => {
        const username = (u.username || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        return (username === identifier || email === identifier) && u.password === pass;
    });
    
    if (foundUser) {
        // Save session
        db.setCurrentUser(foundUser);
        window.location.href = 'index.html';
    } else {
        const errorEl = document.getElementById('loginError');
        errorEl.textContent = 'Tên đăng nhập hoặc mật khẩu không đúng!';
        errorEl.style.display = 'block';
    }
}

function handleRegister(e) {
    e.preventDefault();
    const user = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPassword').value;
    const confirmPass = document.getElementById('regConfirmPassword').value;
    
    const errorEl = document.getElementById('registerError');
    
    if (pass !== confirmPass) {
        errorEl.textContent = 'Mật khẩu xác nhận không khớp!';
        errorEl.style.display = 'block';
        return;
    }
    
    const users = db.getUsers();
    
    // Check if user exists
    if (users.some(u => u.username === user)) {
        errorEl.textContent = 'Tên đăng nhập đã tồn tại!';
        errorEl.style.display = 'block';
        return;
    }
    
    if (users.some(u => u.email === email)) {
        errorEl.textContent = 'Email đã được sử dụng!';
        errorEl.style.display = 'block';
        return;
    }
    
    // Create new user
    const newUser = {
        username: user,
        password: pass,
        email: email,
        role: 'user',
        displayName: user,
        joinDate: new Date().toISOString().split('T')[0]
    };
    
    users.push(newUser);
    db.saveUsers(users);
    
    // Auto login
    db.setCurrentUser(newUser);
    
    alert('Đăng ký thành công! Đang chuyển hướng...');
    window.location.href = 'index.html';
}
