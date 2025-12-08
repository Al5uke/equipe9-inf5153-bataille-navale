"""Serveur Flask pour la bataille navale

Architecture 3-tiers:
- Couche Présentation: API REST Flask
- Couche Application: Services (Matchmaking, Jeu)
- Couche Métier: Logique du jeu (dans game_logic/)
- Couche Données: SQLite3
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
import logging
import uuid
import json
from pathlib import Path

# Importer les modules
from database import db
from game_logic.game import game_engine
from game_logic.grid import GridManager

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Créer l'application Flask
app = Flask(__name__)

# Configuration CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configuration logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============= ROUTES JOUEURS =============

@app.route('/api/players', methods=['POST'])
def create_player():
    """
    Crée un nouveau joueur
    Body: {name, email (optionnel)}
    """
    data = request.get_json()
    player_name = data.get('name')
    player_email = data.get('email')
    
    if not player_name:
        return jsonify({'error': 'Le nom du joueur est requis'}), 400
    
    # Vérifier si le joueur existe déjà
    check_query = "SELECT * FROM players WHERE name = ?"
    existing_players = db.execute_query(check_query, (player_name,))
    
    if existing_players:
        return jsonify({'error': 'Ce nom de joueur est déjà utilisé'}), 409
    
    player_id = str(uuid.uuid4())
    
    query = "INSERT INTO players (id, name, email) VALUES (?, ?, ?)"
    db.execute_insert(query, (player_id, player_name, player_email))
    
    return jsonify({
        'id': player_id,
        'name': player_name,
        'email': player_email,
        'message': 'Joueur créé avec succès'
    }), 201

@app.route('/api/players/<player_id>', methods=['GET'])
def get_player(player_id):
    """Récupère les informations d'un joueur"""
    query = "SELECT * FROM players WHERE id = ?"
    players = db.execute_query(query, (player_id,))
    
    if not players:
        return jsonify({'error': 'Joueur non trouvé'}), 404
    
    return jsonify(players[0]), 200

@app.route('/api/players/<player_id>/stats', methods=['GET'])
def get_player_stats(player_id):
    """Récupère les statistiques d'un joueur"""
    query = """
        SELECT id, name, victories, defeats, total_shots, successful_shots, accuracy
        FROM players WHERE id = ?
    """
    players = db.execute_query(query, (player_id,))
    
    if not players:
        return jsonify({'error': 'Joueur non trouvé'}), 404
    
    player = players[0]
    
    # Ajouter le ratio victoires/défaites
    total_games = player['victories'] + player['defeats']
    win_rate = (player['victories'] / total_games * 100) if total_games > 0 else 0

@app.route('/api/players/<player_id>/ranking', methods=['GET'])
def get_player_ranking(player_id):
    """Récupère le classement et les statistiques d'un joueur"""
    try:
        # Récupérer les stats du joueur
        player_query = """
            SELECT id, name, victories, defeats, total_shots, successful_shots, accuracy
            FROM players WHERE id = ?
        """
        players = db.execute_query(player_query, (player_id,))
        
        if not players:
            return jsonify({'error': 'Joueur non trouvé'}), 404
        
        player = players[0]
        
        # Calculer le score (victoires * 3 - défaites)
        score = player['victories'] * 3 - player['defeats']
        
        # Calculer le rang du joueur
        rank_query = """
            SELECT COUNT(*) + 1 as rank
            FROM players
            WHERE (victories * 3 - defeats) > ?
        """
        rank_result = db.execute_query(rank_query, (score,))
        rank = rank_result[0]['rank']
        
        # Nombre total de joueurs
        total_query = "SELECT COUNT(*) as total FROM players"
        total_result = db.execute_query(total_query)
        total_players = total_result[0]['total']
        
        # Calculer le taux de victoire
        total_games = player['victories'] + player['defeats']
        win_rate = (player['victories'] / total_games * 100) if total_games > 0 else 0
        
        return jsonify({
            'id': player['id'],
            'name': player['name'],
            'rank': rank,
            'total_players': total_players,
            'victories': player['victories'],
            'defeats': player['defeats'],
            'total_games': total_games,
            'score': score,
            'win_rate': win_rate,
            'total_shots': player['total_shots'],
            'successful_shots': player['successful_shots'],
            'accuracy': player['accuracy']
        }), 200
    except Exception as e:
        logger.error(f"Erreur récupération ranking joueur: {e}")
        return jsonify({'error': str(e)}), 500
    
    return jsonify({
        **player,
        'total_games': total_games,
        'win_rate': round(win_rate, 2)
    }), 200

# ============= ROUTES MATCHMAKING =============

@app.route('/api/matchmaking/join', methods=['POST'])
def join_matchmaking():
    """
    Rejoindre la file d'attente pour le matchmaking
    Body: {player_id, player_name}
    """
    data = request.get_json()
    player_id = data.get('player_id')
    player_name = data.get('player_name')
    
    if not player_id or not player_name:
        return jsonify({'error': 'player_id et player_name sont requis'}), 400
    
    # Vérifier si le joueur est déjà dans la file
    check_query = "SELECT * FROM matchmaking_queue WHERE player_id = ?"
    existing = db.execute_query(check_query, (player_id,))
    
    if existing:
        return jsonify({'message': 'Déjà dans la file d\'attente', 'waiting': True}), 200
    
    # Chercher un adversaire disponible
    find_opponent_query = "SELECT * FROM matchmaking_queue WHERE player_id != ? LIMIT 1"
    opponents = db.execute_query(find_opponent_query, (player_id,))
    
    if opponents:
        opponent = opponents[0]
        
        # Créer une partie
        game_id = game_engine.create_game('HUMAN_VS_HUMAN', player_id, opponent['player_id'])
        
        # Retirer les deux joueurs de la file
        remove_query = "DELETE FROM matchmaking_queue WHERE player_id IN (?, ?)"
        db.execute_update(remove_query, (player_id, opponent['player_id']))
        
        return jsonify({
            'message': 'Adversaire trouvé !',
            'matched': True,
            'game_id': game_id,
            'opponent_name': opponent['player_name']
        }), 200
    else:
        # Ajouter à la file d'attente
        queue_id = str(uuid.uuid4())
        insert_query = "INSERT INTO matchmaking_queue (id, player_id, player_name) VALUES (?, ?, ?)"
        db.execute_insert(insert_query, (queue_id, player_id, player_name))
        
        return jsonify({
            'message': 'En attente d\'un adversaire...',
            'waiting': True,
            'matched': False
        }), 200

@app.route('/api/matchmaking/check/<player_id>', methods=['GET'])
def check_matchmaking(player_id):
    """Vérifie si un match a été trouvé"""
    # Vérifier si le joueur est encore dans la file
    check_query = "SELECT * FROM matchmaking_queue WHERE player_id = ?"
    in_queue = db.execute_query(check_query, (player_id,))
    
    if not in_queue:
        # Chercher une partie récente pour ce joueur
        game_query = """
            SELECT * FROM games 
            WHERE (player1_id = ? OR player2_id = ?) 
            AND status IN ('PLACING_SHIPS', 'IN_PROGRESS')
            ORDER BY created_at DESC
            LIMIT 1
        """
        games = db.execute_query(game_query, (player_id, player_id))
        
        if games:
            game = games[0]
            opponent_id = game['player2_id'] if game['player1_id'] == player_id else game['player1_id']
            
            # Récupérer le nom de l'adversaire
            opponent_query = "SELECT name FROM players WHERE id = ?"
            opponent_data = db.execute_query(opponent_query, (opponent_id,))
            opponent_name = opponent_data[0]['name'] if opponent_data else 'Adversaire'
            
            return jsonify({
                'matched': True,
                'game_id': game['id'],
                'opponent_name': opponent_name
            }), 200
    
    return jsonify({'matched': False, 'waiting': True}), 200

@app.route('/api/matchmaking/leave', methods=['POST'])
def leave_matchmaking():
    """Quitter la file d'attente"""
    data = request.get_json()
    player_id = data.get('player_id')
    
    if not player_id:
        return jsonify({'error': 'player_id est requis'}), 400
    
    query = "DELETE FROM matchmaking_queue WHERE player_id = ?"
    db.execute_update(query, (player_id,))
    
    return jsonify({'message': 'Retiré de la file d\'attente'}), 200

# ============= ROUTES PARTIES =============

@app.route('/api/games', methods=['POST'])
def create_game():
    """
    Crée une nouvelle partie
    Body: {mode, player1_id}
    Modes: 'HUMAN_VS_HUMAN', 'HUMAN_VS_AI_RANDOM', 'HUMAN_VS_AI_TARGETED'
    """
    data = request.get_json()
    mode = data.get('mode')
    player1_id = data.get('player1_id')
    
    if not mode or not player1_id:
        return jsonify({'error': 'mode et player1_id sont requis'}), 400
    
    # Créer la partie
    game_id = game_engine.create_game(mode, player1_id)
    
    # Si c'est contre l'IA, placer ses navires automatiquement
    if mode in ['HUMAN_VS_AI_RANDOM', 'HUMAN_VS_AI_TARGETED']:
        ai_id = 'ai_random' if mode == 'HUMAN_VS_AI_RANDOM' else 'ai_targeted'
        game_engine.place_ships_randomly(game_id, ai_id)
    
    return jsonify({
        'game_id': game_id,
        'mode': mode,
        'message': 'Partie créée avec succès'
    }), 201

@app.route('/api/games/<game_id>', methods=['GET'])
def get_game(game_id):
    """Récupère les informations d'une partie"""
    query = "SELECT * FROM games WHERE id = ?"
    games = db.execute_query(query, (game_id,))
    
    if not games:
        return jsonify({'error': 'Partie non trouvée'}), 404
    
    game = games[0]
    
    # Récupérer les infos des joueurs
    player1_query = "SELECT name FROM players WHERE id = ?"
    player1 = db.execute_query(player1_query, (game['player1_id'],))
    
    player2 = None
    if game['player2_id']:
        player2_query = "SELECT name FROM players WHERE id = ?"
        player2 = db.execute_query(player2_query, (game['player2_id'],))
    
    return jsonify({
        **game,
        'player1_name': player1[0]['name'] if player1 else 'Joueur 1',
        'player2_name': player2[0]['name'] if player2 else 'En attente'
    }), 200

@app.route('/api/games/<game_id>/grids', methods=['GET'])
def get_game_grids(game_id):
    """Récupère les grilles d'une partie"""
    query = "SELECT * FROM grids WHERE game_id = ?"
    grids = db.execute_query(query, (game_id,))
    
    result = {}
    for grid in grids:
        result[grid['player_id']] = {
            'id': grid['id'],
            'grid_data': json.loads(grid['grid_data']),
            'ships_placed': bool(grid['ships_placed'])
        }
    
    return jsonify(result), 200

@app.route('/api/games/<game_id>/ships/<player_id>', methods=['GET'])
def get_player_ships(game_id, player_id):
    """Récupère les navires d'un joueur"""
    # Récupérer la grille du joueur
    grid_query = "SELECT id FROM grids WHERE game_id = ? AND player_id = ?"
    grids = db.execute_query(grid_query, (game_id, player_id))
    
    if not grids:
        return jsonify([]), 200
    
    grid_id = grids[0]['id']
    
    # Récupérer les navires
    ships_query = "SELECT * FROM ships WHERE grid_id = ?"
    ships = db.execute_query(ships_query, (grid_id,))
    
    # Désérialiser les positions
    for ship in ships:
        ship['positions'] = json.loads(ship['positions'])
        ship['is_sunk'] = bool(ship['is_sunk'])
    
    return jsonify(ships), 200

@app.route('/api/games/<game_id>/place-ships', methods=['POST'])
def place_ships(game_id):
    """
    Place les navires d'un joueur
    Body: {player_id, ships: [{ship_type, positions, orientation}]}
    """
    data = request.get_json()
    player_id = data.get('player_id')
    ships_data = data.get('ships')
    
    if not player_id or not ships_data:
        return jsonify({'error': 'player_id et ships sont requis'}), 400
    
    success = game_engine.place_ships(game_id, player_id, ships_data)
    
    if not success:
        return jsonify({'error': 'Placement de navires invalide'}), 400
    
    return jsonify({'message': 'Navires placés avec succès'}), 200

@app.route('/api/games/<game_id>/place-ships-random', methods=['POST'])
def place_ships_random(game_id):
    """
    Place les navires aléatoirement pour un joueur
    Body: {player_id}
    """
    data = request.get_json()
    player_id = data.get('player_id')
    
    if not player_id:
        return jsonify({'error': 'player_id est requis'}), 400
    
    success = game_engine.place_ships_randomly(game_id, player_id)
    
    if not success:
        return jsonify({'error': 'Erreur lors du placement aléatoire'}), 400
    
    return jsonify({'message': 'Navires placés aléatoirement avec succès'}), 200

@app.route('/api/games/<game_id>/play', methods=['POST'])
def play_turn(game_id):
    """
    Joue un tour (tire sur une position)
    Body: {player_id, target_position}
    """
    data = request.get_json()
    player_id = data.get('player_id')
    target_position = data.get('target_position')
    
    if not player_id or not target_position:
        return jsonify({'error': 'player_id et target_position sont requis'}), 400
    
    result = game_engine.play_turn(game_id, player_id, target_position)
    
    if 'error' in result:
        return jsonify(result), 400
    
    return jsonify(result), 200

@app.route('/api/games/<game_id>/ai-turn', methods=['POST'])
def ai_turn(game_id):
    """
    Fait jouer l'IA
    Body: {ai_player_id}
    """
    data = request.get_json()
    ai_player_id = data.get('ai_player_id')
    
    if not ai_player_id:
        return jsonify({'error': 'ai_player_id est requis'}), 400
    
    # Générer le coup de l'IA
    target = game_engine.get_ai_move(game_id, ai_player_id)
    
    if not target:
        return jsonify({'error': 'Impossible de générer un coup pour l\'IA'}), 400
    
    # Jouer le coup
    result = game_engine.play_turn(game_id, ai_player_id, target)
    
    if 'error' in result:
        return jsonify(result), 400
    
    return jsonify({
        **result,
        'ai_target': target
    }), 200

@app.route('/api/games/<game_id>/moves', methods=['GET'])
def get_game_moves(game_id):
    """Récupère tous les coups d'une partie"""
    query = "SELECT * FROM moves WHERE game_id = ? ORDER BY move_number"
    moves = db.execute_query(query, (game_id,))
    
    return jsonify(moves), 200

# ============= ROUTES CLASSEMENT & STATISTIQUES =============

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    """Récupère le classement des joueurs"""
    query = """
        SELECT p.id, p.name, p.victories, p.defeats, p.accuracy,
               (p.victories - p.defeats) as score
        FROM players p
        WHERE p.id NOT LIKE 'ai_%'
        ORDER BY score DESC, p.victories DESC
        LIMIT 20
    """
    leaderboard = db.execute_query(query)
    
    # Ajouter le rang
    for idx, entry in enumerate(leaderboard, 1):
        entry['rank'] = idx
    
    return jsonify(leaderboard), 200

# ============= ROUTES MODE SPECTATEUR =============

@app.route('/api/spectator/games', methods=['GET'])
def get_spectatable_games():
    """Récupère les parties en cours (pour le mode spectateur)"""
    query = """
        SELECT g.*, 
               p1.name as player1_name,
               p2.name as player2_name
        FROM games g
        JOIN players p1 ON g.player1_id = p1.id
        LEFT JOIN players p2 ON g.player2_id = p2.id
        WHERE g.status = 'IN_PROGRESS'
        ORDER BY g.created_at DESC
    """
    games = db.execute_query(query)
    
    return jsonify(games), 200

@app.route('/api/spectator/games/<game_id>', methods=['GET'])
def get_spectator_view(game_id):
    """Récupère la vue spectateur d'une partie"""
    # Récupérer la partie
    game_query = "SELECT * FROM games WHERE id = ?"
    games = db.execute_query(game_query, (game_id,))
    
    if not games:
        return jsonify({'error': 'Partie non trouvée'}), 404
    
    game = games[0]
    
    # Récupérer les grilles
    grids_query = "SELECT * FROM grids WHERE game_id = ?"
    grids = db.execute_query(grids_query, (game_id,))
    
    # Récupérer les coups
    moves_query = "SELECT * FROM moves WHERE game_id = ? ORDER BY move_number"
    moves = db.execute_query(moves_query, (game_id,))
    
    grids_data = {}
    for grid in grids:
        grids_data[grid['player_id']] = json.loads(grid['grid_data'])
    
    return jsonify({
        'game': game,
        'grids': grids_data,
        'moves': moves
    }), 200

# ============= ROUTE TEST =============

@app.route('/api/', methods=['GET'])
def hello():
    return jsonify({'message': 'Bienvenue dans le jeu Bataille Navale'}), 200

@app.route('/api/health', methods=['GET'])
def health_check():
    """Vérifie que le serveur et la DB fonctionnent"""
    try:
        # Test de connexion à la DB
        db.execute_query("SELECT 1")
        return jsonify({'status': 'healthy', 'database': 'connected'}), 200
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

# ============= ROUTES ADMIN =============

@app.route('/api/admin/players', methods=['GET'])
def admin_get_all_players():
    """Récupère tous les joueurs pour l'admin"""
    try:
        query = """
            SELECT id, name, email, victories, defeats, 
                   total_shots, successful_shots, accuracy
            FROM players
            ORDER BY victories DESC, name ASC
        """
        players = db.execute_query(query)
        return jsonify(players), 200
    except Exception as e:
        logger.error(f"Erreur récupération joueurs admin: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/stats', methods=['GET'])
def admin_get_stats():
    """Récupère les statistiques globales"""
    try:
        # Nombre total de joueurs
        players_query = "SELECT COUNT(*) as count FROM players"
        players_result = db.execute_query(players_query)
        total_players = players_result[0]['count']
        
        # Nombre total de parties
        games_query = "SELECT COUNT(*) as count FROM games"
        games_result = db.execute_query(games_query)
        total_games = games_result[0]['count']
        
        return jsonify({
            'total_players': total_players,
            'total_games': total_games
        }), 200
    except Exception as e:
        logger.error(f"Erreur récupération stats: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/players/<player_id>', methods=['DELETE'])
def admin_delete_player(player_id):
    """Supprime un joueur"""
    try:
        # Vérifier que le joueur existe
        check_query = "SELECT * FROM players WHERE id = ?"
        player = db.execute_query(check_query, (player_id,))
        
        if not player:
            return jsonify({'error': 'Joueur non trouvé'}), 404
        
        # Supprimer le joueur
        delete_query = "DELETE FROM players WHERE id = ?"
        db.execute_update(delete_query, (player_id,))
        
        return jsonify({'message': 'Joueur supprimé avec succès'}), 200
    except Exception as e:
        logger.error(f"Erreur suppression joueur: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/reset-database', methods=['POST'])
def admin_reset_database():
    """Réinitialise toute la base de données"""
    try:
        # Supprimer toutes les données
        db.execute_update("DELETE FROM moves")
        db.execute_update("DELETE FROM ships")
        db.execute_update("DELETE FROM grids")
        db.execute_update("DELETE FROM games")
        db.execute_update("DELETE FROM players")
        db.execute_update("DELETE FROM matchmaking_queue")
        
        logger.info("Base de données réinitialisée par l'admin")
        return jsonify({'message': 'Base de données réinitialisée avec succès'}), 200
    except Exception as e:
        logger.error(f"Erreur réinitialisation DB: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001, debug=True)