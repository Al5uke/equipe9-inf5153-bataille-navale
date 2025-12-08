-- Script d'initialisation de la base de données SQLite3
-- Bataille Navale - Projet INF5153

-- Table des joueurs
CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    victories INTEGER DEFAULT 0,
    defeats INTEGER DEFAULT 0,
    total_shots INTEGER DEFAULT 0,
    successful_shots INTEGER DEFAULT 0,
    accuracy REAL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des parties
CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    mode TEXT NOT NULL CHECK(mode IN ('HUMAN_VS_HUMAN', 'HUMAN_VS_AI_RANDOM', 'HUMAN_VS_AI_TARGETED')),
    player1_id TEXT NOT NULL,
    player2_id TEXT,
    current_turn TEXT,
    status TEXT NOT NULL DEFAULT 'WAITING' CHECK(status IN ('WAITING', 'PLACING_SHIPS', 'IN_PROGRESS', 'FINISHED')),
    winner_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP,
    FOREIGN KEY (player1_id) REFERENCES players(id),
    FOREIGN KEY (player2_id) REFERENCES players(id),
    FOREIGN KEY (winner_id) REFERENCES players(id)
);

-- Table des grilles (chaque joueur a une grille)
CREATE TABLE IF NOT EXISTS grids (
    id TEXT PRIMARY KEY,
    game_id TEXT NOT NULL,
    player_id TEXT NOT NULL,
    grid_data TEXT NOT NULL,
    ships_placed BOOLEAN DEFAULT 0,
    FOREIGN KEY (game_id) REFERENCES games(id),
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Table des navires
CREATE TABLE IF NOT EXISTS ships (
    id TEXT PRIMARY KEY,
    grid_id TEXT NOT NULL,
    ship_type TEXT NOT NULL CHECK(ship_type IN ('PORTE_AVION', 'CROISEUR', 'SOUS_MARIN', 'CONTRE_TORPILLEUR', 'TORPILLEUR')),
    size INTEGER NOT NULL,
    positions TEXT NOT NULL,
    orientation TEXT NOT NULL CHECK(orientation IN ('HORIZONTAL', 'VERTICAL')),
    hits INTEGER DEFAULT 0,
    is_sunk BOOLEAN DEFAULT 0,
    FOREIGN KEY (grid_id) REFERENCES grids(id)
);

-- Table des coups joués
CREATE TABLE IF NOT EXISTS moves (
    id TEXT PRIMARY KEY,
    game_id TEXT NOT NULL,
    player_id TEXT NOT NULL,
    target_position TEXT NOT NULL,
    result TEXT NOT NULL CHECK(result IN ('MISS', 'HIT', 'SUNK')),
    ship_sunk_type TEXT,
    move_number INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id),
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Table du classement (leaderboard)
CREATE TABLE IF NOT EXISTS leaderboard (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL UNIQUE,
    rank INTEGER,
    score INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Table de la file d'attente pour le matchmaking
CREATE TABLE IF NOT EXISTS matchmaking_queue (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL UNIQUE,
    player_name TEXT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_player1 ON games(player1_id);
CREATE INDEX IF NOT EXISTS idx_games_player2 ON games(player2_id);
CREATE INDEX IF NOT EXISTS idx_grids_game ON grids(game_id);
CREATE INDEX IF NOT EXISTS idx_ships_grid ON ships(grid_id);
CREATE INDEX IF NOT EXISTS idx_moves_game ON moves(game_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);

-- Données de test (joueurs IA)
INSERT OR IGNORE INTO players (id, name, email, victories, defeats) 
VALUES 
    ('ai_random', 'IA Aléatoire', 'ia_random@battleship.com', 0, 0),
    ('ai_targeted', 'IA Ciblée', 'ia_targeted@battleship.com', 0, 0);
