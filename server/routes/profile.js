const express = require('express');
const router = express.Router();
const db = require('../db/db');

// تغییر پسورد کاربر
router.post('/change-password', (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;
  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'اطلاعات ناقص است' });
  }
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'کاربر یافت نشد' });
    }
    if (user.password !== currentPassword) {
      return res.status(400).json({ error: 'رمز فعلی اشتباه است!' });
    }
    db.run('UPDATE users SET password = ? WHERE id = ?', [newPassword, userId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'خطا در تغییر رمز' });
      }
      res.json({ success: true });
    });
  });
});

module.exports = router; 