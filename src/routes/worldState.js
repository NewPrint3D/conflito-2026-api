const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET current world war state
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM world_war_state ORDER BY zone_name');
    res.json({ 
      war_status: 'active',
      zones: result.rows,
      last_update: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET zone modifiers (climate + events)
router.get('/modifiers', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT zam.*, cz.name as zone_name 
       FROM zone_active_modifiers zam 
       JOIN conflict_zones cz ON zam.zone_id = cz.zone_id 
       WHERE zam.is_active = true 
       ORDER BY zam.zone_id`
    );
    res.json({ active_modifiers: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET dynamic events log
router.get('/events', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM dynamic_events_log ORDER BY executed_at DESC LIMIT 20'
    );
    res.json({ recent_events: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
