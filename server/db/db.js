const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

// ساخت جدول کاربران
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT,
      manager_id INTEGER
    );
  `, [], (err) => {
    if (!err) {
      // اگر هیچ کاربری وجود نداشت، ادمین پیش‌فرض بساز
      db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (!err && row.count === 0) {
          db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', '1234', 'admin']);
        }
      });
    }
  });
});

// // حذف جدول قدیمی vendors و ساخت جدول جدید
// db.run(`DROP TABLE IF EXISTS vendors`);

db.run(`
  CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_by INTEGER,
    shop_name TEXT NOT NULL,
    manager_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    shop_type TEXT NOT NULL,
    marketing_area_type TEXT NOT NULL,
    marketing_area_name TEXT NOT NULL,
    is_first_visit TEXT NOT NULL,
    contract_registered TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    negotiation_result TEXT,
    refuse_reason TEXT,
    description TEXT,
    has_showcase_signboard TEXT,
    has_minimum_area TEXT,
    photo TEXT,
    latitude REAL,
    longitude REAL,
    city TEXT,
    street TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = db;
