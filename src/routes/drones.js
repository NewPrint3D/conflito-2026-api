const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET all drone models
router.get('/models', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT dm.*, ic.base_price_eur, ic.name as item_name 
       FROM drone_models dm 
       JOIN items_catalog ic ON dm.base_item_id = ic.item_id 
       ORDER BY dm.class`
    );
    res.json({ drone_models: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all drone upgrades
router.get('/upgrades', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM drone_upgrades ORDER BY required_level, cost_virtual');
    res.json({ upgrades: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET flight log for a player
router.get('/flights/:player_id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT dfl.*, dm.name as model_name, dm.class as drone_class 
       FROM drone_flight_log dfl 
       JOIN drone_models dm ON dfl.drone_model_id = dm.model_id 
       WHERE dfl.player_id = $1 
       ORDER BY dfl.launched_at DESC LIMIT 20`,
      [req.params.player_id]
    );
    res.json({ player_id: req.params.player_id, flights: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET countermeasure systems by zone
router.get('/countermeasures/:zone_id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM countermeasure_systems WHERE zone_id = $1 AND is_active = true',
      [req.params.zone_id]
    );
    res.json({ zone_id: req.params.zone_id, countermeasures: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
