const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET all active missions (for Zeigarnik effect display)
router.get('/active', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pm.*, p.username 
       FROM player_missions pm 
       JOIN players p ON pm.player_id = p.player_id 
       WHERE pm.is_active = true 
       ORDER BY pm.completion_percentage DESC LIMIT 50`
    );
    res.json({ active_missions: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create a new mission for a player
router.post('/', async (req, res) => {
  try {
    const { player_id, mission_name } = req.body;
    if (!player_id || !mission_name) return res.status(400).json({ error: 'player_id and mission_name are required' });

    const result = await pool.query(
      'INSERT INTO player_missions (player_id, mission_name) VALUES ($1, $2) RETURNING *',
      [player_id, mission_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH update mission progress
router.patch('/:id', async (req, res) => {
  try {
    const { completion_percentage, is_active } = req.body;
    const result = await pool.query(
      `UPDATE player_missions 
       SET completion_percentage = COALESCE($1, completion_percentage), 
           is_active = COALESCE($2, is_active),
           updated_at = NOW()
       WHERE mission_id = $3 RETURNING *`,
      [completion_percentage, is_active, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Mission not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
