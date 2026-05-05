const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET all items catalog
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT item_id, name, category, base_price_eur, ucraniya_bonus_multiplier FROM items_catalog';
    let params = [];
    
    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }
    query += ' ORDER BY category, base_price_eur';
    
    const result = await pool.query(query, params);
    res.json({ count: result.rows.length, items: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET item by ID with current market price
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ic.*, mf.current_multiplier, mf.valid_until,
        ROUND(ic.base_price_eur * COALESCE(mf.current_multiplier, 1.00), 2) as current_price
       FROM items_catalog ic
       LEFT JOIN market_fluctuations mf ON ic.item_id = mf.item_id AND mf.valid_until > NOW()
       WHERE ic.item_id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
