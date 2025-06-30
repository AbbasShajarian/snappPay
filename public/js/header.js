// header.js

function createHeader() {
  const header = document.createElement('header');
  header.className = 'header';

  // بررسی جهت صفحه
  const isRTL = document.documentElement.dir === 'rtl' || document.body.dir === 'rtl';
  const isDashboard = window.location.pathname.includes('dashboard.html');

  let actionsHTML = '';
  // فقط اگر داشبورد نبود دکمه بازگشت نمایش بده
  if (!isDashboard) {
    actionsHTML += '<button class="header-logout-btn" onclick="logout()">خروج</button>';
    actionsHTML += '<button class="header-back-btn" onclick="goBack()">بازگشت</button>';
  } else {
    actionsHTML += '<button class="header-logout-btn" onclick="logout()">خروج</button>';
  }

  // لوگو
  const logoHTML = '<div class="header-logo"><img src="snapp-logo.png" alt="لوگو"></div>';
  // عنوان وسط
  // const titleHTML = '<div class="header-title"><h1>سیستم مدیریت وندورها</h1></div>';
  // دکمه‌ها
  const actionsDivHTML = `<div class="header-actions">${actionsHTML}</div>`;

  // ترتیب بخش‌ها بر اساس جهت صفحه
  if (isRTL) {
    header.innerHTML = `${logoHTML}${actionsDivHTML}`;
  } else {
    header.innerHTML = `${actionsDivHTML}${logoHTML}`;
  }

  return header;
}

function goBack() {
  if (window.location.pathname.includes('dashboard.html')) {
    return;
  }
  window.location.href = 'dashboard.html';
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', function() {
  if (!window.location.pathname.includes('index.html')) {
    if (!document.querySelector('link[href*="header.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'css/base/header.css';
      document.head.appendChild(link);
    }
    const header = createHeader();
    document.body.insertBefore(header, document.body.firstChild);
    document.body.classList.add('has-header');
  }
});