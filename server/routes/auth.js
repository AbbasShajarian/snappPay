const express = require('express');
const router = express.Router();
const db = require('../db/db');

// ثبت کاربر اولیه (مثلاً admin) برای تست
router.post('/seed', (req, res) => {
  const { username, password, role } = req.body;

  db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
    [username, password, role],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    });
});

// ورود
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get(`SELECT * FROM users WHERE username = ? AND password = ?`,
    [username, password],
    (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(401).json({ error: 'نام کاربری یا رمز اشتباه است' });

      // برای سادگی، نام کاربری را به عنوان توکن استفاده می‌کنیم
      res.json({ 
        username: user.username, 
        role: user.role, 
        id: user.id,
        token: user.username // نام کاربری به عنوان توکن
      });
    });
});

module.exports = router;
