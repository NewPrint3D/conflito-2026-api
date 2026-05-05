const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET recent matches
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ms.*, cz.name as zone_name, cz.terrain_type 
       FROM match_sessions ms 
       JOIN conflict_zones cz ON ms.zone_id = cz.zone_id 
       ORDER BY ms.start_time DESC LIMIT 20`
    );
    res.json({ recent_matches: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET match details with player stats
router.get('/:id', async (req, res) => {
  try {
    const match = await pool.query(
      `SELECT ms.*, cz.name as zone_name 
       FROM match_sessions ms 
       JOIN conflict_zones cz ON ms.zone_id = cz.zone_id 
       WHERE ms.match_id = $1`,
      [req.params.id]
    );
    if (match.rows.length === 0) return res.status(404).json({ error: 'Match not found' });

    const stats = await pool.query(
      `SELECT pcs.*, p.username, p.chosen_nation 
       FROM player_combat_stats pcs 
       JOIN players p ON pcs.player_id = p.player_id 
       WHERE pcs.match_id = $1 
       ORDER BY pcs.kills DESC`,
      [req.params.id]
    );

    res.json({ match: match.rows[0], players: stats.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
