const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET current market prices with fluctuations
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ic.item_id, ic.name, ic.category, ic.base_price_eur,
        COALESCE(mf.current_multiplier, 1.00) as multiplier,
        ROUND(ic.base_price_eur * COALESCE(mf.current_multiplier, 1.00), 2) as current_price,
        mf.valid_until,
        CASE 
          WHEN mf.current_multiplier < 1.00 THEN 'DISCOUNT'
          WHEN mf.current_multiplier > 1.00 THEN 'INFLATED'
          ELSE 'NORMAL'
        END as market_status
       FROM items_catalog ic
       LEFT JOIN market_fluctuations mf ON ic.item_id = mf.item_id AND mf.valid_until > NOW()
       ORDER BY ic.category, ic.price_eur`
    );
    res.json({ 
      market_update: new Date().toISOString(),
      next_fluctuation: '4 hours',
      items: result.rows 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST simulate market fluctuation (admin/testing)
router.post('/fluctuate', async (req, res) => {
  try {
    const items = await pool.query('SELECT item_id FROM items_catalog');
    const fluctuations = [];

    for (const item of items.rows) {
      const multiplier = (0.95 + Math.random() * 0.10).toFixed(2); // 0.95 to 1.05
      const validUntil = new Date(Date.now() + 4 * 60 * 60 * 1000); // +4 hours

      await pool.query(
        `INSERT INTO market_fluctuations (item_id, current_multiplier, valid_until) 
         VALUES ($1, $2, $3)
         ON CONFLICT (item_id) DO UPDATE SET current_multiplier = $2, valid_until = $3`,
        [item.item_id, multiplier, validUntil]
      );
      fluctuations.push({ item_id: item.item_id, multiplier, valid_until: validUntil });
    }

    res.json({ message: 'Market fluctuation applied', fluctuations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
