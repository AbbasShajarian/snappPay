// Middleware برای بررسی دسترسی ادمین
function requireAdmin(req, res, next) {
  const user = req.user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'دسترسی غیرمجاز' });
  }
  next();
}

module.exports = { requireAdmin }; 