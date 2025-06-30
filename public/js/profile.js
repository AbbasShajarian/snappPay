document.getElementById('changePasswordForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const current = document.getElementById('currentPassword').value;
  const newPass = document.getElementById('newPassword').value;
  const confirm = document.getElementById('confirmPassword').value;
  const message = document.getElementById('message');

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  if (newPass !== confirm) {
    message.textContent = 'رمزهای جدید یکسان نیستند!';
    message.style.color = 'red';
    return;
  }

  try {
    const res = await fetch('/api/profile/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId: user.id,
        currentPassword: current,
        newPassword: newPass
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'خطا در تغییر رمز');
    message.textContent = 'رمز با موفقیت تغییر یافت';
    message.style.color = 'green';
    
    // بعد از موفقیت، 1.5 ثانیه صبر کن و بعد logout کن
    setTimeout(() => {
      logout();
    }, 500);
  } catch (err) {
    message.textContent = err.message;
    message.style.color = 'red';
  }
});