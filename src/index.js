const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { pool } = require('./db');

// Import routes
const playersRoutes = require('./routes/players');
const itemsRoutes = require('./routes/items');
const worldStateRoutes = require('./routes/worldState');
const missionsRoutes = require('./routes/missions');
const dronesRoutes = require('./routes/drones');
const matchesRoutes = require('./routes/matches');
const marketRoutes = require('./routes/market');
const zonesRoutes = require('./routes/zones');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Health check
app.get('/', (req, res) => {
  res.json({
    game: 'Conflito 2026: Resistência Infinita',
    status: 'online',
    version: '1.0.0-prototype',
    modules: [
      'Economia & Inventário',
      'Narrativa & Psicologia',
      'Zonas de Conflito',
      'Drones FPV',
      'Multiplayer & Ranking',
      'UI/HUD & Notificações',
      'Crafting & Oficina',
      'Clima Dinâmico',
      'Pagamentos',
      'Administração'
    ]
  });
});

// API Routes
app.use('/api/players', playersRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/world-state', worldStateRoutes);
app.use('/api/missions', missionsRoutes);
app.use('/api/drones', dronesRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/zones', zonesRoutes);
app.use('/api/stats', statsRoutes);

// Database status endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as server_time, count(*) as total_tables FROM information_schema.tables WHERE table_schema = $1', ['public']);
    res.json({
      status: 'healthy',
      database: 'connected',
      server_time: result.rows[0].server_time,
      total_tables: parseInt(result.rows[0].total_tables),
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Conflito 2026] Server running on port ${PORT}`);
  console.log(`[Conflito 2026] Environment: ${process.env.NODE_ENV || 'development'}`);
});
