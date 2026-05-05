const { pool } = require('./db');
require('dotenv').config();

async function seed() {
  console.log('[SEED] Starting database seeding...');

  try {
    // 1. Seed conflict zones (terrain_type: URBAN, INDUSTRIAL, RURAL | current_owner: Rusiya, Ucraniya, NEUTRAL)
    console.log('[SEED] Creating conflict zones...');
    await pool.query(`
      INSERT INTO conflict_zones (name, terrain_type, base_strategic_value, current_owner) VALUES
        ('Donskaya', 'INDUSTRIAL', 150, 'Rusiya'),
        ('Kievgrad', 'URBAN', 200, 'Ucraniya'),
        ('Fronteira de Aço', 'RURAL', 100, 'NEUTRAL')
      ON CONFLICT DO NOTHING
    `);

    // 2. Seed control points
    console.log('[SEED] Creating control points...');
    await pool.query(`
      INSERT INTO control_points (zone_id, point_name, coordinate_x, coordinate_y, capture_status) VALUES
        (1, 'Refinaria Alpha', 120.5, 340.2, 75.00),
        (1, 'Ponte Ferroviária', 200.1, 150.8, 30.00),
        (1, 'Depósito de Munição', 80.3, 420.6, 100.00),
        (2, 'Praça Central', 500.0, 500.0, 50.00),
        (2, 'Torre de Comunicações', 350.2, 620.1, 85.00),
        (2, 'Estação de Metrô', 450.8, 280.4, 20.00),
        (3, 'Trincheira Norte', 100.0, 50.0, 60.00),
        (3, 'Bunker Subterrâneo', 300.5, 200.3, 40.00),
        (3, 'Campo Minado Leste', 500.0, 100.0, 10.00)
      ON CONFLICT DO NOTHING
    `);

    // 3. Seed world war state
    console.log('[SEED] Setting world war state...');
    await pool.query(`
      INSERT INTO world_war_state (zone_id, zone_name, control_percentage_east, control_percentage_west, tension_index) VALUES
        (1, 'Donskaya', 65.00, 35.00, 72),
        (2, 'Kievgrad', 30.00, 70.00, 85),
        (3, 'Fronteira de Aço', 50.00, 50.00, 55)
      ON CONFLICT DO NOTHING
    `);

    // 4. Seed items catalog (category: Armamento, Medio, Avancado, Drone_Kamikaze, High_Tech)
    console.log('[SEED] Creating items catalog...');
    await pool.query(`
      INSERT INTO items_catalog (name, category, base_price_eur, ucraniya_bonus_multiplier) VALUES
        ('Drone FPV-77 Standard', 'Drone_Kamikaze', 1.20, 1.00),
        ('Drone Kamikaze K-9', 'Drone_Kamikaze', 3.50, 0.90),
        ('Drone Recon Phantom', 'High_Tech', 2.00, 1.20),
        ('Drone Pesado Urso', 'Avancado', 5.00, 0.80),
        ('Rifle AK-Modernizado', 'Armamento', 0.80, 0.90),
        ('Rifle M4-Tático', 'Armamento', 0.80, 1.10),
        ('Sniper Dragunov-X', 'Armamento', 2.50, 0.80),
        ('Jammer Portátil EW-3', 'High_Tech', 4.00, 1.00),
        ('Kit Médico Avançado', 'Medio', 0.50, 1.00),
        ('Colete Balístico Nível IV', 'Medio', 1.50, 1.00),
        ('Câmera Térmica Upgrade', 'High_Tech', 3.00, 1.00),
        ('Motor Silencioso Upgrade', 'Avancado', 2.50, 1.00),
        ('Carga Extra Explosiva', 'Avancado', 4.50, 0.90),
        ('Skin Camuflagem Urbana', 'Medio', 1.00, 1.00),
        ('Skin Camuflagem Florestal', 'Medio', 1.00, 1.00)
      ON CONFLICT DO NOTHING
    `);

    // 5. Seed drone models (class: FPV_LIGHT, HEAVY_BOMBER, RECON, FIXED_WING)
    console.log('[SEED] Creating drone models...');
    await pool.query(`
      INSERT INTO drone_models (name, class, base_item_id, max_speed_kmh, signal_range_meters, explosive_yield_kg, battery_life_seconds, weather_resistance_rating) VALUES
        ('FPV-77 Standard', 'FPV_LIGHT', 1, 120, 2000, 0.5, 480, 25),
        ('Kamikaze K-9', 'HEAVY_BOMBER', 2, 180, 3000, 2.0, 300, 15),
        ('Recon Phantom', 'RECON', 3, 80, 5000, 0.0, 900, 35),
        ('Urso Pesado', 'FIXED_WING', 4, 60, 1500, 5.0, 360, 40)
      ON CONFLICT DO NOTHING
    `);

    // 6. Seed drone upgrades (bonus_type: BATTERY, SIGNAL, STEALTH, THERMAL, DAMAGE)
    console.log('[SEED] Creating drone upgrades...');
    await pool.query(`
      INSERT INTO drone_upgrades (name, bonus_type, bonus_value, cost_eur, min_player_level, description) VALUES
        ('Câmera Térmica', 'THERMAL', 50, 3.00, 3, 'Visão térmica para detecção noturna'),
        ('Motor Silencioso', 'STEALTH', 70, 2.50, 5, 'Reduz ruído em 70%'),
        ('Carga Extra C4', 'DAMAGE', 80, 4.50, 7, 'Aumenta dano em 80%'),
        ('Bateria Estendida', 'BATTERY', 30, 2.00, 2, 'Aumenta duração em 30%'),
        ('Antena Amplificada', 'SIGNAL', 500, 3.50, 4, 'Aumenta alcance em 500m')
      ON CONFLICT DO NOTHING
    `);

    // 7. Seed war seasons
    console.log('[SEED] Creating war seasons...');
    await pool.query(`
      INSERT INTO war_seasons (season_name, start_date, end_date, narrative_theme, is_active) VALUES
        ('Temporada 1: Despertar', '2026-05-01', '2026-07-31', 'O conflito começa. Duas nações se preparam para a guerra total.', true),
        ('Temporada 2: Escalada', '2026-08-01', '2026-10-31', 'A guerra se intensifica. Novas armas e drones entram no campo de batalha.', false)
      ON CONFLICT DO NOTHING
    `);

    // 8. Seed game config
    console.log('[SEED] Setting game configuration...');
    await pool.query(`
      INSERT INTO game_config (config_key, config_value, description) VALUES
        ('drone_fpv_base_damage', '50', 'Dano base do drone FPV Standard'),
        ('market_fluctuation_percentage', '5', 'Percentual máximo de flutuação do mercado'),
        ('market_fluctuation_interval_hours', '4', 'Intervalo entre flutuações de mercado'),
        ('max_squad_size', '5', 'Número máximo de membros por squad'),
        ('zeigarnik_notification_hours', '24', 'Horas de inatividade para disparar push de retenção'),
        ('yerkes_dodson_min_tension', '30', 'Tensão mínima antes de ativar eventos de estímulo'),
        ('yerkes_dodson_max_tension', '85', 'Tensão máxima antes de ativar aliados ocultos'),
        ('weather_sync_interval_minutes', '30', 'Intervalo de sincronização do clima real'),
        ('max_daily_notifications', '3', 'Máximo de notificações push por dia por jogador'),
        ('crafting_success_base_rate', '75', 'Taxa base de sucesso no crafting (%)'),
        ('season_duration_days', '90', 'Duração de cada temporada em dias')
      ON CONFLICT DO NOTHING
    `);

    // 9. Seed countermeasure systems (type: JAMMER, NET_GUN, AA_TURRET, EW_STATION)
    console.log('[SEED] Creating countermeasure systems...');
    await pool.query(`
      INSERT INTO countermeasure_systems (zone_id, name, type, effective_radius_meters, interference_strength) VALUES
        (1, 'Jammer Donskaya Norte', 'JAMMER', 500, 80),
        (1, 'AA Turret Refinaria', 'AA_TURRET', 300, 60),
        (2, 'Jammer Kievgrad Central', 'JAMMER', 400, 75),
        (2, 'Net Gun Praça', 'NET_GUN', 200, 50),
        (3, 'EW Station Fronteira', 'EW_STATION', 350, 65)
      ON CONFLICT DO NOTHING
    `);

    // 10. Seed zone weather state (condition: CLEAR, RAIN, SNOW, FOG, STORM)
    console.log('[SEED] Setting initial weather...');
    await pool.query(`
      INSERT INTO zone_weather_state (zone_id, temperature_celsius, condition, wind_speed_kmh, visibility_range_meters, battery_drain_multiplier, flight_instability_index) VALUES
        (1, 12.0, 'FOG', 15, 850, 1.05, 0.20),
        (2, 8.0, 'RAIN', 25, 600, 1.20, 0.45),
        (3, 5.0, 'CLEAR', 10, 1000, 1.00, 0.10)
      ON CONFLICT DO NOTHING
    `);

    // 11. Seed credit packages
    console.log('[SEED] Creating credit packages...');
    await pool.query(`
      INSERT INTO credit_packages (name, price_eur, credit_amount, bonus_amount, is_active, max_purchases_per_player) VALUES
        ('Pacote Recruta', 4.99, 500, 0, true, 999),
        ('Pacote Soldado', 9.99, 1100, 100, true, 999),
        ('Pacote Comandante', 19.99, 2500, 500, true, 999),
        ('Pacote General', 49.99, 7000, 2000, true, 999),
        ('Pacote Boas-Vindas', 0.99, 150, 50, true, 1)
      ON CONFLICT DO NOTHING
    `);

    // 12. Create test players (chosen_nation: Rusiya, Ucraniya)
    console.log('[SEED] Creating test players...');
    await pool.query(`
      INSERT INTO players (username, chosen_nation, prestige_level, wallet_virtual, wallet_real) VALUES
        ('Comandante_Leste', 'Rusiya', 5, 2500.00, 15.00),
        ('Defensor_Kiev', 'Ucraniya', 7, 3200.00, 22.50),
        ('Drone_Master_77', 'Rusiya', 3, 1800.00, 8.00),
        ('Shadow_Recon', 'Ucraniya', 4, 2100.00, 12.00),
        ('Steel_Frontier', 'Rusiya', 2, 900.00, 5.00)
      ON CONFLICT DO NOTHING
    `);

    console.log('[SEED] ✓ Database seeding completed successfully!');
    console.log('[SEED] ✓ Game "Conflito 2026: Resistência Infinita" is ready.');
  } catch (error) {
    console.error('[SEED] Error:', error.message);
  } finally {
    await pool.end();
  }
}

seed();
