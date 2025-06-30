function goTo(page) {
    window.location.href = page;
  }
  
  window.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const welcome = document.getElementById('welcome');
    const adminBtn = document.getElementById('adminBtn');
    const vendorBtn = document.getElementById('vendorBtn');
  
    if (!user) {
      window.location.href = 'index.html';
      return;
    }
  
    welcome.textContent = `خوش آمدید، ${user.username} (${user.role})`;
  
    // نقش‌ها: admin - manager - user
    if (user.role !== 'admin') {
      adminBtn.style.display = 'none';
    }
  
    if (user.role === 'manager') {
      vendorBtn.style.display = 'none';
    }
  });
  