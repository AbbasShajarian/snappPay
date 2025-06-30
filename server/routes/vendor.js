const express = require('express');
const router = express.Router();
const db = require('../db/db');

// گرفتن لیست وندورها برای گزارش‌گیری
router.post('/list', (req, res) => {
  const { role, userId, filters } = req.body;

  let baseQuery = `SELECT vendors.*, users.username AS promoter_name
                   FROM vendors
                   LEFT JOIN users ON vendors.created_by = users.id
                   WHERE 1=1`;
  let params = [];

  if (role === 'user') {
    baseQuery += ` AND vendors.created_by = ?`;
    params.push(userId);
  } else if (role === 'manager') {
    // پیدا کردن همه زیرمجموعه‌ها تا ۵ لایه
    const subQuery = `WITH RECURSIVE subordinates(id, level) AS (
      SELECT id, 1 FROM users WHERE manager_id = ?
      UNION ALL
      SELECT u.id, s.level + 1 FROM users u
      JOIN subordinates s ON u.manager_id = s.id
      WHERE s.level < 5
    ) SELECT id FROM subordinates`;
    db.all(subQuery, [userId], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const ids = rows.map(r => r.id);
      ids.push(userId); // خود مدیر هم باید باشد
      let filterStr = ids.map(() => '?').join(',');
      let finalQuery = baseQuery + ` AND vendors.created_by IN (${filterStr})`;
      let finalParams = [...params, ...ids];

      // فیلترها
      if (filters?.shop_type) {
        finalQuery += ` AND vendors.shop_type = ?`;
        finalParams.push(filters.shop_type);
      }
      if (filters?.marketing_area_type) {
        finalQuery += ` AND vendors.marketing_area_type = ?`;
        finalParams.push(filters.marketing_area_type);
      }
      if (filters?.marketing_area_name) {
        finalQuery += ` AND vendors.marketing_area_name = ?`;
        finalParams.push(filters.marketing_area_name);
      }
      if (filters?.has_valid_license) {
        finalQuery += ` AND vendors.has_valid_license = ?`;
        finalParams.push(filters.has_valid_license);
      }
      if (filters?.has_rental_agreement) {
        finalQuery += ` AND vendors.has_rental_agreement = ?`;
        finalParams.push(filters.has_rental_agreement);
      }
      if (filters?.is_first_visit) {
        finalQuery += ` AND vendors.is_first_visit = ?`;
        finalParams.push(filters.is_first_visit);
      }
      if (filters?.contract_registered) {
        finalQuery += ` AND vendors.contract_registered = ?`;
        finalParams.push(filters.contract_registered);
      }
      if (filters?.has_bank_account) {
        finalQuery += ` AND vendors.has_bank_account = ?`;
        finalParams.push(filters.has_bank_account);
      }
      if (filters?.has_showcase_signboard) {
        finalQuery += ` AND vendors.has_showcase_signboard = ?`;
        finalParams.push(filters.has_showcase_signboard);
      }
      if (filters?.has_minimum_area) {
        finalQuery += ` AND vendors.has_minimum_area = ?`;
        finalParams.push(filters.has_minimum_area);
      }
      if (filters?.city) {
        finalQuery += ` AND vendors.city = ?`;
        finalParams.push(filters.city);
      }
      if (filters?.promoterId) {
        finalQuery += ` AND vendors.created_by = ?`;
        finalParams.push(filters.promoterId);
      }
      if (filters?.startDate && filters?.endDate) {
        finalQuery += ` AND DATE(SUBSTR(vendors.start_time, 1, 10)) BETWEEN ? AND ?`;
        finalParams.push(filters.startDate, filters.endDate);
      }
      if (filters?.negotiation_result) {
        finalQuery += ` AND vendors.negotiation_result = ?`;
        finalParams.push(filters.negotiation_result);
      }
      finalQuery += ` ORDER BY vendors.id DESC`;
      db.all(finalQuery, finalParams, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      });
    });
    return;
  }

  // نقش admin یا حالت عادی
  if (filters?.shop_type) {
    baseQuery += ` AND vendors.shop_type = ?`;
    params.push(filters.shop_type);
  }
  if (filters?.marketing_area_type) {
    baseQuery += ` AND vendors.marketing_area_type = ?`;
    params.push(filters.marketing_area_type);
  }
  if (filters?.marketing_area_name) {
    baseQuery += ` AND vendors.marketing_area_name = ?`;
    params.push(filters.marketing_area_name);
  }
  if (filters?.has_valid_license) {
    baseQuery += ` AND vendors.has_valid_license = ?`;
    params.push(filters.has_valid_license);
  }
  if (filters?.has_rental_agreement) {
    baseQuery += ` AND vendors.has_rental_agreement = ?`;
    params.push(filters.has_rental_agreement);
  }
  if (filters?.is_first_visit) {
    baseQuery += ` AND vendors.is_first_visit = ?`;
    params.push(filters.is_first_visit);
  }
  if (filters?.contract_registered) {
    baseQuery += ` AND vendors.contract_registered = ?`;
    params.push(filters.contract_registered);
  }
  if (filters?.has_bank_account) {
    baseQuery += ` AND vendors.has_bank_account = ?`;
    params.push(filters.has_bank_account);
  }
  if (filters?.has_showcase_signboard) {
    baseQuery += ` AND vendors.has_showcase_signboard = ?`;
    params.push(filters.has_showcase_signboard);
  }
  if (filters?.has_minimum_area) {
    baseQuery += ` AND vendors.has_minimum_area = ?`;
    params.push(filters.has_minimum_area);
  }
  if (filters?.city) {
    baseQuery += ` AND vendors.city = ?`;
    params.push(filters.city);
  }
  if (filters?.promoterId) {
    baseQuery += ` AND vendors.created_by = ?`;
    params.push(filters.promoterId);
  }
  if (filters?.startDate && filters?.endDate) {
    baseQuery += ` AND DATE(SUBSTR(vendors.start_time, 1, 10)) BETWEEN ? AND ?`;
    params.push(filters.startDate, filters.endDate);
  }
  if (filters?.negotiation_result) {
    baseQuery += ` AND vendors.negotiation_result = ?`;
    params.push(filters.negotiation_result);
  }
  baseQuery += ` ORDER BY vendors.id DESC`;

  db.all(baseQuery, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// افزودن وندور جدید
router.post('/add', (req, res) => {
  const {
    shop_name, manager_name, phone_number, shop_type, marketing_area_type, marketing_area_name,
    has_valid_license, has_rental_agreement, is_first_visit, contract_registered,
    start_time, end_time, negotiation_result, description, has_bank_account,
    has_showcase_signboard, has_minimum_area, photo, latitude, longitude, city, street, created_by
  } = req.body;

  if (!shop_name || !manager_name || !phone_number || !shop_type || !marketing_area_type || 
      !marketing_area_name || !has_valid_license || !has_rental_agreement || !is_first_visit || 
      !contract_registered || !created_by) {
    return res.status(400).json({ error: 'همه فیلدهای ضروری را پر کنید' });
  }

  const query = `INSERT INTO vendors
    (shop_name, manager_name, phone_number, shop_type, marketing_area_type, marketing_area_name,
     has_valid_license, has_rental_agreement, is_first_visit, contract_registered,
     start_time, end_time, negotiation_result, description, has_bank_account,
     has_showcase_signboard, has_minimum_area, photo, latitude, longitude, city, street, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  const params = [
    shop_name, manager_name, phone_number, shop_type, marketing_area_type, marketing_area_name,
    has_valid_license, has_rental_agreement, is_first_visit, contract_registered,
    start_time, end_time, negotiation_result, description, has_bank_account,
    has_showcase_signboard, has_minimum_area, photo, latitude, longitude, city, street, created_by
  ];

  db.run(query, params, function(err) {
    if (err) {
      console.error('Error inserting vendor:', err);
      return res.status(500).json({ error: 'خطا در ثبت وندور' });
    }
    res.json({ success: true, id: this.lastID });
  });
});

// گرفتن نام‌های منحصر به فرد مناطق مارکتینگی
router.get('/marketing-areas', (req, res) => {
  const query = `SELECT DISTINCT marketing_area_name FROM vendors WHERE marketing_area_name IS NOT NULL AND marketing_area_name != '' ORDER BY marketing_area_name`;
  
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const areas = rows.map(row => row.marketing_area_name);
    res.json(areas);
  });
});

module.exports = router;