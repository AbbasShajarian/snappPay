const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const vendorRoutes = require('./routes/vendor');
const adminRoutes = require('./routes/admin');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = 3000;

// Middleware برای احراز هویت
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'توکن احراز هویت یافت نشد' });
  }
  
  // برای سادگی، توکن را همان نام کاربری در نظر می‌گیریم
  // در پروژه واقعی باید JWT استفاده شود
  const db = require('./db/db');
  db.get('SELECT * FROM users WHERE username = ?', [token], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: 'توکن نامعتبر است' });
    }
    req.user = user;
    next();
  });
}

app.use(cors());
// افزایش limit برای bodyParser
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// // تنظیم CORS برای اجازه دادن به همه origin‌ها (برای تست محلی)
// app.use(cors({
//   origin: 'http://localhost:3000', // یا '*' برای همه origin‌ها (فقط برای توسعه)
//   methods: ['GET', 'POST', 'OPTIONS'], // اجازه دادن به متدهای مختلف
//   allowedHeaders: ['Content-Type']
// }));


app.use(bodyParser.json());
app.use('/api/vendor', authMiddleware, vendorRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/profile', authMiddleware, profileRoutes);

// // Middleware برای مدیریت خطاهای ناشناخته
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: 'خطای سرور داخلی' });
// });


app.listen(PORT, '0.0.0.0',() => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// // سرور رو با مدیریت خطا راه‌اندازی کن
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// }).on('error', (err) => {
//   console.error('Server error:', err);
// });

app.use(express.static('public')); // فرض می‌کنیم HTML و JS توی پوشه public هست
