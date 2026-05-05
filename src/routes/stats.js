const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET global game statistics (dashboard)
router.get('/global', async (req, res) => {
  try {
    const players = await pool.query('SELECT COUNT(*) as total, chosen_nation FROM players GROUP BY chosen_nation');
    const matches = await pool.query('SELECT COUNT(*) as total_matches FROM match_sessions');
    const zones = await pool.query('SELECT name, current_owner FROM conflict_zones');
    
    const totalPlayers = await pool.query('SELECT COUNT(*) as total FROM players');
    const rusiya = await pool.query("SELECT COUNT(*) as count FROM players WHERE chosen_nation = 'Rusiya'");
    const ucraniya = await pool.query("SELECT COUNT(*) as count FROM players WHERE chosen_nation = 'Ucraniya'");

    res.json({
      overview: {
        total_players: parseInt(totalPlayers.rows[0].total),
        faction_distribution: {
          rusiya: parseInt(rusiya.rows[0].count),
          ucraniya: parseInt(ucraniya.rows[0].count)
        },
        total_matches: parseInt(matches.rows[0].total_matches),
      },
      territory_control: zones.rows,
      server_time: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET rankings
router.get('/rankings', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT gr.*, p.username, p.chosen_nation, ws.season_name
       FROM global_rankings gr
       JOIN players p ON gr.player_id = p.player_id
       JOIN war_seasons ws ON gr.season_id = ws.season_id
       ORDER BY gr.elo_score DESC LIMIT 100`
    );
    res.json({ rankings: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET game configuration
router.get('/config', async (req, res) => {
  try {
    const result = await pool.query('SELECT config_key, config_value, description FROM game_config ORDER BY config_key');
    const config = {};
    result.rows.forEach(row => {
      config[row.config_key] = { value: row.config_value, description: row.description };
    });
    res.json({ game_config: config });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
