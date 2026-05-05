const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET all players
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT player_id, username, chosen_nation, prestige_level, wallet_virtual, wallet_real, created_at FROM players ORDER BY prestige_level DESC LIMIT 50');
    res.json({ count: result.rows.length, players: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET player by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM players WHERE player_id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Player not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new player
router.post('/', async (req, res) => {
  try {
    const { username, chosen_nation } = req.body;
    if (!username || !chosen_nation) return res.status(400).json({ error: 'username and chosen_nation are required' });
    if (!['Rusiya', 'Ucraniya'].includes(chosen_nation)) return res.status(400).json({ error: 'chosen_nation must be Rusiya or Ucraniya' });

    const result = await pool.query(
      'INSERT INTO players (username, chosen_nation) VALUES ($1, $2) RETURNING *',
      [username, chosen_nation]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET player inventory
router.get('/:id/inventory', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pi.*, ic.item_name, ic.category, ic.price_eur 
       FROM player_inventory pi 
       JOIN items_catalog ic ON pi.item_id = ic.item_id 
       WHERE pi.player_id = $1`,
      [req.params.id]
    );
    res.json({ player_id: req.params.id, items: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET player missions (Zeigarnik effect)
router.get('/:id/missions', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM player_missions WHERE player_id = $1 ORDER BY is_active DESC, updated_at DESC',
      [req.params.id]
    );
    res.json({ player_id: req.params.id, missions: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET player combat stats
router.get('/:id/combat-stats', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_matches,
        SUM(kills) as total_kills,
        SUM(deaths) as total_deaths,
        ROUND(AVG(accuracy_percentage), 2) as avg_accuracy,
        SUM(drones_deployed) as total_drones_deployed,
        SUM(drones_destroyed) as total_drones_destroyed,
        SUM(points_captured) as total_points_captured,
        SUM(xp_gained) as total_xp
       FROM player_combat_stats WHERE player_id = $1`,
      [req.params.id]
    );
    res.json({ player_id: req.params.id, stats: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
