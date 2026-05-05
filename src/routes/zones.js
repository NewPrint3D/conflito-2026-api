const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET all conflict zones
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cz.*, 
        (SELECT COUNT(*) FROM control_points cp WHERE cp.zone_id = cz.zone_id) as total_control_points
       FROM conflict_zones cz 
       ORDER BY cz.zone_id`
    );
    res.json({ zones: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET zone details with control points and weather
router.get('/:id', async (req, res) => {
  try {
    const zone = await pool.query('SELECT * FROM conflict_zones WHERE zone_id = $1', [req.params.id]);
    if (zone.rows.length === 0) return res.status(404).json({ error: 'Zone not found' });

    const points = await pool.query('SELECT * FROM control_points WHERE zone_id = $1', [req.params.id]);
    const weather = await pool.query('SELECT * FROM zone_weather_state WHERE zone_id = $1', [req.params.id]);
    const modifiers = await pool.query('SELECT * FROM zone_active_modifiers WHERE zone_id = $1 AND is_active = true', [req.params.id]);

    res.json({
      zone: zone.rows[0],
      control_points: points.rows,
      weather: weather.rows[0] || null,
      active_modifiers: modifiers.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
