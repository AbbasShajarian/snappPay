document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorBox = document.getElementById('loginError');

  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'خطا در ورود');
    }

    // ذخیره اطلاعات کاربر در localStorage
    localStorage.setItem('user', JSON.stringify({
      username: data.username,
      role: data.role,
      id: data.id
    }));
    
    // ذخیره توکن
    localStorage.setItem('token', data.token);

    // هدایت به داشبورد
    window.location.href = 'dashboard.html';

  } catch (err) {
    errorBox.textContent = err.message;
  }
});
