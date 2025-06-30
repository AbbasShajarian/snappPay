const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { requireAdmin } = require('../middlewares');

// دریافت لیست همه کاربران
router.get('/users', requireAdmin, (req, res) => {
  const query = `
    SELECT u.id, u.username, u.role, u.manager_id, m.username as manager_name
    FROM users u
    LEFT JOIN users m ON u.manager_id = m.id
    ORDER BY u.id
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ message: 'خطا در دریافت کاربران' });
    }
    res.json(rows);
  });
});

// دریافت لیست مدیران
router.get('/managers', requireAdmin, (req, res) => {
  const query = `
    SELECT id, username 
    FROM users 
    WHERE role IN ('admin', 'manager')
    ORDER BY username
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching managers:', err);
      return res.status(500).json({ message: 'خطا در دریافت مدیران' });
    }
    res.json(rows);
  });
});

// دریافت اطلاعات یک کاربر خاص
router.get('/users/:id', requireAdmin, (req, res) => {
  const userId = req.params.id;
  
  const query = `
    SELECT u.id, u.username, u.role, u.manager_id, m.username as manager_name
    FROM users u
    LEFT JOIN users m ON u.manager_id = m.id
    WHERE u.id = ?
  `;
  
  db.get(query, [userId], (err, user) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ message: 'خطا در دریافت کاربر' });
    }
    
    if (!user) {
      return res.status(404).json({ message: 'کاربر یافت نشد' });
    }
    
    res.json(user);
  });
});

// اضافه کردن کاربر جدید
router.post('/users', requireAdmin, (req, res) => {
  const { username, password, role, manager_id } = req.body;
  
  if (!username || !password || !role) {
    return res.status(400).json({ message: 'تمام فیلدها الزامی است' });
  }
  
  // بررسی تکراری نبودن نام کاربری
  db.get('SELECT id FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      console.error('Error checking username:', err);
      return res.status(500).json({ message: 'خطا در بررسی نام کاربری' });
    }
    
    if (row) {
      return res.status(400).json({ message: 'نام کاربری تکراری است' });
    }
    
    // ذخیره پسورد بدون رمزگذاری (برای تست)
    const query = `
      INSERT INTO users (username, password, role, manager_id)
      VALUES (?, ?, ?, ?)
    `;
    
    db.run(query, [username, password, role, manager_id || null], function(err) {
      if (err) {
        console.error('Error creating user:', err);
        return res.status(500).json({ message: 'خطا در ایجاد کاربر' });
      }
      
      res.status(201).json({ 
        message: 'کاربر با موفقیت ایجاد شد',
        userId: this.lastID 
      });
    });
  });
});

// حذف کاربر
router.delete('/users/:id', requireAdmin, (req, res) => {
  const userId = req.params.id;
  
  // بررسی اینکه کاربر خودش را حذف نکند
  if (parseInt(userId) === req.user.id) {
    return res.status(400).json({ message: 'نمی‌توانید خودتان را حذف کنید' });
  }
  
  // بررسی اینکه کاربر زیردست نداشته باشد
  db.get('SELECT id FROM users WHERE manager_id = ?', [userId], (err, row) => {
    if (err) {
      console.error('Error checking subordinates:', err);
      return res.status(500).json({ message: 'خطا در بررسی زیردستان' });
    }
    
    if (row) {
      return res.status(400).json({ message: 'این کاربر زیردست دارد و قابل حذف نیست' });
    }
    
    // حذف کاربر
    db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
      if (err) {
        console.error('Error deleting user:', err);
        return res.status(500).json({ message: 'خطا در حذف کاربر' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: 'کاربر یافت نشد' });
      }
      
      res.json({ message: 'کاربر با موفقیت حذف شد' });
    });
  });
});

// ویرایش کاربر
router.put('/users/:id', requireAdmin, (req, res) => {
  const userId = req.params.id;
  const { username, password, role, manager_id } = req.body;
  
  // بررسی وجود کاربر
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ message: 'خطا در دریافت کاربر' });
    }
    
    if (!user) {
      return res.status(404).json({ message: 'کاربر یافت نشد' });
    }
    
    let query = 'UPDATE users SET username = ?, role = ?, manager_id = ?';
    let params = [username, role, manager_id || null];
    
    // اگر پسورد جدید ارائه شده، آن را اضافه کن
    if (password) {
      query += ', password = ?';
      params.push(password);
    }
    
    query += ' WHERE id = ?';
    params.push(userId);
    
    db.run(query, params, function(err) {
      if (err) {
        console.error('Error updating user:', err);
        return res.status(500).json({ message: 'خطا در بروزرسانی کاربر' });
      }
      
      res.json({ message: 'کاربر با موفقیت بروزرسانی شد' });
    });
  });
});

module.exports = router; 