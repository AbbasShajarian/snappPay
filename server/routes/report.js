// اگر requireAdmin استفاده نشده، import آن را حذف کن.

// گرفتن لیست وندورها برای گزارش‌گیری (با نقش‌ها و فیلتر کامل)
router.post('/list', (req, res) => {
    const { role, userId, filters } = req.body;
  
    let baseQuery = `
      SELECT vendors.*, users.username AS promoter_name
      FROM vendors
      LEFT JOIN users ON vendors.created_by = users.id
      WHERE 1=1`;
    let params = [];
  
    if (role === 'user') {
      baseQuery += ` AND vendors.created_by = ?`;
      params.push(userId);
    } else if (role === 'manager') {
      baseQuery += ` AND (vendors.created_by = ? OR vendors.created_by IN (
        SELECT id FROM users WHERE manager_id = ?
      ))`;
      params.push(userId, userId);
    }
  
    if (filters?.type) {
      baseQuery += ` AND vendors.type LIKE ?`;
      params.push(`%${filters.type}%`);
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
      baseQuery += ` AND DATE(vendors.start_time) BETWEEN ? AND ?`;
      params.push(filters.startDate, filters.endDate);
    }
  
    if (filters?.result) {
      baseQuery += ` AND vendors.result = ?`;
      params.push(filters.result);
    }
  
    baseQuery += ` ORDER BY vendors.id DESC`;
  
    db.all(baseQuery, params, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });
  