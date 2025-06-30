// بررسی دسترسی ادمین
document.addEventListener('DOMContentLoaded', function() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || user.role !== 'admin') {
    alert('شما دسترسی به این صفحه ندارید');
    window.location.href = 'dashboard.html';
    return;
  }

  loadUsers();
  loadManagers();
  
  // بستن modal با کلیک خارج از آن
  window.onclick = function(event) {
    const modal = document.getElementById('editUserModal');
    if (event.target === modal) {
      closeEditModal();
    }
  }
});

// نمایش پیام
function showMessage(message, type, elementId = 'addUserMessage') {
  const messageDiv = document.getElementById(elementId);
  messageDiv.textContent = message;
  messageDiv.className = `message ${type}`;
  
  setTimeout(() => {
    messageDiv.textContent = '';
    messageDiv.className = 'message';
  }, 3000);
}

// تبدیل نام نقش
function getRoleName(role) {
  const roles = {
    'admin': 'ادمین',
    'manager': 'مدیر',
    'user': 'کاربر'
  };
  return roles[role] || role;
}

// بارگذاری لیست کاربران
async function loadUsers() {
  try {
    const response = await fetch('/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const users = await response.json();
      displayUsers(users);
    } else {
      showMessage('خطا در بارگذاری کاربران', 'error');
    }
  } catch (error) {
    console.error('Error loading users:', error);
    showMessage('خطا در بارگذاری کاربران', 'error');
  }
}

// نمایش کاربران در جدول
function displayUsers(users) {
  const tbody = document.querySelector('#usersTable tbody');
  tbody.innerHTML = '';

  users.forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.username}</td>
      <td>${getRoleName(user.role)}</td>
      <td>${user.manager_name || '-'}</td>
      <td>
        <div class="action-buttons">
          <button class="edit-btn" onclick="editUser(${user.id})">ویرایش</button>
          <button class="delete-btn" onclick="deleteUser(${user.id})">حذف</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// بارگذاری لیست مدیران برای انتخاب
async function loadManagers() {
  try {
    const response = await fetch('/api/admin/managers', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const managers = await response.json();
      const select = document.getElementById('managerId');
      const editSelect = document.getElementById('editManagerId');
      
      // پر کردن select اصلی
      managers.forEach(manager => {
        const option = document.createElement('option');
        option.value = manager.id;
        option.textContent = manager.username;
        select.appendChild(option);
      });
      
      // پر کردن select ویرایش
      managers.forEach(manager => {
        const option = document.createElement('option');
        option.value = manager.id;
        option.textContent = manager.username;
        editSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading managers:', error);
  }
}

// فرم اضافه کردن کاربر
document.getElementById('addUserForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const formData = {
    username: document.getElementById('newUsername').value,
    password: document.getElementById('newPassword').value,
    role: document.getElementById('newRole').value,
    manager_id: document.getElementById('managerId').value || null
  };

  try {
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      showMessage('کاربر با موفقیت اضافه شد', 'success');
      document.getElementById('addUserForm').reset();
      loadUsers();
    } else {
      const error = await response.json();
      showMessage(error.message || 'خطا در اضافه کردن کاربر', 'error');
    }
  } catch (error) {
    console.error('Error adding user:', error);
    showMessage('خطا در اضافه کردن کاربر', 'error');
  }
});

// ویرایش کاربر
async function editUser(userId) {
  try {
    // دریافت اطلاعات کاربر
    const response = await fetch(`/api/admin/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const user = await response.json();
      
      // پر کردن فرم ویرایش
      document.getElementById('editUserId').value = user.id;
      document.getElementById('editUsername').value = user.username;
      document.getElementById('editRole').value = user.role;
      document.getElementById('editManagerId').value = user.manager_id || '';
      document.getElementById('editPassword').value = '';
      
      // نمایش modal
      document.getElementById('editUserModal').style.display = 'block';
    } else {
      showMessage('خطا در دریافت اطلاعات کاربر', 'error');
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    showMessage('خطا در دریافت اطلاعات کاربر', 'error');
  }
}

// بستن modal ویرایش
function closeEditModal() {
  document.getElementById('editUserModal').style.display = 'none';
  document.getElementById('editUserForm').reset();
  document.getElementById('editUserMessage').textContent = '';
}

// فرم ویرایش کاربر
document.getElementById('editUserForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const userId = document.getElementById('editUserId').value;
  const formData = {
    username: document.getElementById('editUsername').value,
    role: document.getElementById('editRole').value,
    manager_id: document.getElementById('editManagerId').value || null
  };
  
  // اگر رمز جدید وارد شده، اضافه کن
  const password = document.getElementById('editPassword').value;
  if (password) {
    formData.password = password;
  }

  try {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      showMessage('کاربر با موفقیت ویرایش شد', 'success', 'editUserMessage');
      setTimeout(() => {
        closeEditModal();
        loadUsers(); // بارگذاری مجدد لیست
      }, 1500);
    } else {
      const error = await response.json();
      showMessage(error.message || 'خطا در ویرایش کاربر', 'error', 'editUserMessage');
    }
  } catch (error) {
    console.error('Error updating user:', error);
    showMessage('خطا در ویرایش کاربر', 'error', 'editUserMessage');
  }
});

// حذف کاربر
async function deleteUser(userId) {
  if (!confirm('آیا مطمئن هستید که می‌خواهید این کاربر را حذف کنید؟')) {
    return;
  }

  try {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      showMessage('کاربر با موفقیت حذف شد', 'success');
      loadUsers();
    } else {
      const error = await response.json();
      showMessage(error.message || 'خطا در حذف کاربر', 'error');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    showMessage('خطا در حذف کاربر', 'error');
  }
} 