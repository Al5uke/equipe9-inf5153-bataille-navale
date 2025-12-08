"""Logique principale du jeu de bataille navale"""
import uuid
import json
from typing import Dict, List, Optional, Tuple
from datetime import datetime

from database import db
from models import Game, Grid, Ship, Move, Player, SHIP_TYPES
from game_logic.grid import GridManager
from game_logic.ship import ShipManager
from game_logic.ai_strategy import AIStrategyFactory

class GameEngine:
    """Moteur de jeu pour gérer la logique de la bataille navale"""
    
    def __init__(self):
        self.ai_strategies = {}  # Cache des stratégies IA par partie
    
    def create_game(self, mode: str, player1_id: str, player2_id: Optional[str] = None) -> str:
        """
        Crée une nouvelle partie
        Retourne: game_id
        """
        game_id = str(uuid.uuid4())
        
        # Si mode IA, définir le joueur 2 comme IA
        if mode in ['HUMAN_VS_AI_RANDOM', 'HUMAN_VS_AI_TARGETED']:
            ai_type = 'ai_random' if mode == 'HUMAN_VS_AI_RANDOM' else 'ai_targeted'
            player2_id = ai_type
        
        # Insérer la partie dans la DB
        query = """
            INSERT INTO games (id, mode, player1_id, player2_id, status, current_turn)
            VALUES (?, ?, ?, ?, 'PLACING_SHIPS', ?)
        """
        db.execute_insert(query, (game_id, mode, player1_id, player2_id, player1_id))
        
        # Créer les grilles pour les deux joueurs
        self._create_grid(game_id, player1_id)
        if player2_id:
            self._create_grid(game_id, player2_id)
        
        return game_id
    
    def _create_grid(self, game_id: str, player_id: str):
        """Crée une grille vide pour un joueur"""
        grid_id = str(uuid.uuid4())
        empty_grid = GridManager.create_empty_grid()
        
        query = """
            INSERT INTO grids (id, game_id, player_id, grid_data, ships_placed)
            VALUES (?, ?, ?, ?, 0)
        """
        db.execute_insert(query, (grid_id, game_id, player_id, GridManager.serialize_grid(empty_grid)))
        
        return grid_id
    
    def place_ships(self, game_id: str, player_id: str, ships_data: List[Dict]) -> bool:
        """
        Place les navires d'un joueur
        ships_data: liste de {ship_type, positions, orientation}
        """
        # Récupérer la grille
        query = "SELECT * FROM grids WHERE game_id = ? AND player_id = ?"
        grids = db.execute_query(query, (game_id, player_id))
        
        if not grids:
            return False
        
        grid_row = grids[0]
        grid = GridManager.deserialize_grid(grid_row['grid_data'])
        grid_id = grid_row['id']
        
        # Valider et placer chaque navire
        for ship_info in ships_data:
            positions = ship_info['positions']
            
            # Vérifier que le placement est valide
            if not GridManager.can_place_ship(grid, positions):
                return False
            
            # Placer le navire sur la grille
            GridManager.place_ship(grid, positions)
            
            # Enregistrer le navire en DB
            ship_id = str(uuid.uuid4())
            ship_query = """
                INSERT INTO ships (id, grid_id, ship_type, size, positions, orientation, hits, is_sunk)
                VALUES (?, ?, ?, ?, ?, ?, 0, 0)
            """
            db.execute_insert(ship_query, (
                ship_id,
                grid_id,
                ship_info['ship_type'],
                ship_info['size'],
                json.dumps(positions),
                ship_info['orientation']
            ))
        
        # Mettre à jour la grille
        update_query = "UPDATE grids SET grid_data = ?, ships_placed = 1 WHERE id = ?"
        db.execute_update(update_query, (GridManager.serialize_grid(grid), grid_id))
        
        # Vérifier si les deux joueurs ont placé leurs navires
        self._check_both_players_ready(game_id)
        
        return True
    
    def place_ships_randomly(self, game_id: str, player_id: str) -> bool:
        """Place les navires aléatoirement pour un joueur"""
        # Récupérer la grille
        query = "SELECT * FROM grids WHERE game_id = ? AND player_id = ?"
        grids = db.execute_query(query, (game_id, player_id))
        
        if not grids:
            return False
        
        grid_row = grids[0]
        grid = GridManager.deserialize_grid(grid_row['grid_data'])
        grid_id = grid_row['id']
        
        # Placer les navires aléatoirement
        ships_data = ShipManager.place_all_ships_randomly(grid)
        
        # Enregistrer les navires en DB
        for ship_info in ships_data:
            ship_id = str(uuid.uuid4())
            ship_query = """
                INSERT INTO ships (id, grid_id, ship_type, size, positions, orientation, hits, is_sunk)
                VALUES (?, ?, ?, ?, ?, ?, 0, 0)
            """
            db.execute_insert(ship_query, (
                ship_id,
                grid_id,
                ship_info['ship_type'],
                ship_info['size'],
                json.dumps(ship_info['positions']),
                ship_info['orientation']
            ))
        
        # Mettre à jour la grille
        update_query = "UPDATE grids SET grid_data = ?, ships_placed = 1 WHERE id = ?"
        db.execute_update(update_query, (GridManager.serialize_grid(grid), grid_id))
        
        # Vérifier si les deux joueurs ont placé leurs navires
        self._check_both_players_ready(game_id)
        
        return True
    
    def _check_both_players_ready(self, game_id: str):
        """Vérifie si les deux joueurs ont placé leurs navires et démarre la partie"""
        query = "SELECT COUNT(*) as count FROM grids WHERE game_id = ? AND ships_placed = 1"
        result = db.execute_query(query, (game_id,))
        
        if result[0]['count'] == 2:
            # Les deux joueurs sont prêts, démarrer la partie
            update_query = "UPDATE games SET status = 'IN_PROGRESS' WHERE id = ?"
            db.execute_update(update_query, (game_id,))
    
    def play_turn(self, game_id: str, player_id: str, target_position: str) -> Dict:
        """
        Joue un tour (tire sur une position)
        Retourne: {result, ship_sunk_type, game_over, winner_id}
        """
        # Vérifier que c'est bien le tour du joueur
        game_query = "SELECT * FROM games WHERE id = ?"
        games = db.execute_query(game_query, (game_id,))
        
        if not games:
            return {'error': 'Partie non trouvée'}
        
        game = games[0]
        
        if game['current_turn'] != player_id:
            return {'error': 'Ce n\'est pas votre tour'}
        
        if game['status'] != 'IN_PROGRESS':
            return {'error': 'La partie n\'est pas en cours'}
        
        # Déterminer l'adversaire
        opponent_id = game['player2_id'] if game['player1_id'] == player_id else game['player1_id']
        
        # Récupérer la grille de l'adversaire
        grid_query = "SELECT * FROM grids WHERE game_id = ? AND player_id = ?"
        opponent_grids = db.execute_query(grid_query, (game_id, opponent_id))
        
        if not opponent_grids:
            return {'error': 'Grille adversaire non trouvée'}
        
        opponent_grid_row = opponent_grids[0]
        opponent_grid = GridManager.deserialize_grid(opponent_grid_row['grid_data'])
        
        # Traiter le tir
        result, already_shot = GridManager.process_shot(opponent_grid, target_position)
        
        if already_shot:
            return {'error': 'Position déjà tirée'}
        
        # Mettre à jour la grille
        update_grid_query = "UPDATE grids SET grid_data = ? WHERE id = ?"
        db.execute_update(update_grid_query, (GridManager.serialize_grid(opponent_grid), opponent_grid_row['id']))
        
        # Vérifier si un navire est coulé
        ship_sunk_type = None
        if result == 'HIT':
            ship_sunk_type = self._check_ship_sunk(opponent_grid_row['id'], target_position, opponent_grid)
            if ship_sunk_type:
                result = 'SUNK'
        
        # Enregistrer le coup
        move_id = str(uuid.uuid4())
        move_query = """
            SELECT COUNT(*) as count FROM moves WHERE game_id = ?
        """
        move_count = db.execute_query(move_query, (game_id,))[0]['count']
        
        insert_move_query = """
            INSERT INTO moves (id, game_id, player_id, target_position, result, ship_sunk_type, move_number)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """
        db.execute_insert(insert_move_query, (
            move_id, game_id, player_id, target_position, result, ship_sunk_type, move_count + 1
        ))
        
        # Vérifier si tous les navires adverses sont coulés
        game_over, winner_id = self._check_game_over(game_id, opponent_id, opponent_grid_row['id'])
        
        if game_over:
            # Mettre à jour la partie
            update_game_query = "UPDATE games SET status = 'FINISHED', winner_id = ?, finished_at = ? WHERE id = ?"
            db.execute_update(update_game_query, (player_id, datetime.now().isoformat(), game_id))
            
            # Mettre à jour les statistiques
            self._update_player_stats(player_id, opponent_id, game_id)
        else:
            # Changer de tour
            update_turn_query = "UPDATE games SET current_turn = ? WHERE id = ?"
            db.execute_update(update_turn_query, (opponent_id, game_id))
        
        return {
            'result': result,
            'ship_sunk_type': ship_sunk_type,
            'game_over': game_over,
            'winner_id': winner_id if game_over else None
        }
    
    def _check_ship_sunk(self, grid_id: str, hit_position: str, grid: Dict[str, str]) -> Optional[str]:
        """Vérifie si le navire touché est coulé"""
        # Récupérer tous les navires de la grille
        ships_query = "SELECT * FROM ships WHERE grid_id = ?"
        ships = db.execute_query(ships_query, (grid_id,))
        
        for ship in ships:
            positions = json.loads(ship['positions'])
            
            # Vérifier si le tir touche ce navire
            if hit_position in positions:
                # Vérifier si toutes les positions du navire sont touchées
                if ShipManager.check_if_ship_sunk(positions, grid):
                    # Marquer le navire comme coulé
                    update_ship_query = "UPDATE ships SET is_sunk = 1, hits = ? WHERE id = ?"
                    db.execute_update(update_ship_query, (len(positions), ship['id']))
                    return ship['ship_type']
                else:
                    # Incrémenter le nombre de touches
                    update_hits_query = "UPDATE ships SET hits = hits + 1 WHERE id = ?"
                    db.execute_update(update_hits_query, (ship['id'],))
                break
        
        return None
    
    def _check_game_over(self, game_id: str, opponent_id: str, opponent_grid_id: str) -> Tuple[bool, Optional[str]]:
        """Vérifie si tous les navires de l'adversaire sont coulés"""
        ships_query = "SELECT COUNT(*) as total, SUM(is_sunk) as sunk FROM ships WHERE grid_id = ?"
        result = db.execute_query(ships_query, (opponent_grid_id,))
        
        if result[0]['total'] == result[0]['sunk']:
            return True, None  # winner_id sera défini par l'appelant
        
        return False, None
    
    def _update_player_stats(self, winner_id: str, loser_id: str, game_id: str):
        """Met à jour les statistiques des joueurs"""
        # Statistiques du gagnant
        winner_update = "UPDATE players SET victories = victories + 1 WHERE id = ?"
        db.execute_update(winner_update, (winner_id,))
        
        # Statistiques du perdant
        if not loser_id.startswith('ai_'):
            loser_update = "UPDATE players SET defeats = defeats + 1 WHERE id = ?"
            db.execute_update(loser_update, (loser_id,))
        
        # Mettre à jour la précision (ratio coups réussis / total)
        moves_query = "SELECT player_id, COUNT(*) as total, SUM(CASE WHEN result IN ('HIT', 'SUNK') THEN 1 ELSE 0 END) as hits FROM moves WHERE game_id = ? GROUP BY player_id"
        moves_stats = db.execute_query(moves_query, (game_id,))
        
        for stat in moves_stats:
            player_id = stat['player_id']
            total = stat['total']
            hits = stat['hits'] or 0
            
            if not player_id.startswith('ai_'):
                accuracy_update = """
                    UPDATE players 
                    SET total_shots = total_shots + ?, 
                        successful_shots = successful_shots + ?,
                        accuracy = CAST(successful_shots + ? AS REAL) / (total_shots + ?)
                    WHERE id = ?
                """
                db.execute_update(accuracy_update, (total, hits, hits, total, player_id))
    
    def get_ai_move(self, game_id: str, ai_player_id: str) -> str:
        """Génère un coup pour l'IA"""
        # Récupérer la partie
        game_query = "SELECT * FROM games WHERE id = ?"
        games = db.execute_query(game_query, (game_id,))
        
        if not games:
            return None
        
        game = games[0]
        
        # Déterminer l'adversaire
        opponent_id = game['player1_id'] if ai_player_id == game['player2_id'] else game['player2_id']
        
        # Récupérer la grille de l'adversaire (vue par l'IA)
        grid_query = "SELECT * FROM grids WHERE game_id = ? AND player_id = ?"
        opponent_grids = db.execute_query(grid_query, (game_id, opponent_id))
        
        if not opponent_grids:
            return None
        
        opponent_grid = GridManager.deserialize_grid(opponent_grids[0]['grid_data'])
        
        # Récupérer les coups précédents de l'IA
        moves_query = "SELECT * FROM moves WHERE game_id = ? AND player_id = ? ORDER BY move_number"
        previous_moves = db.execute_query(moves_query, (game_id, ai_player_id))
        
        # Créer ou récupérer la stratégie
        if game_id not in self.ai_strategies:
            strategy_type = 'RANDOM' if ai_player_id == 'ai_random' else 'TARGETED'
            self.ai_strategies[game_id] = AIStrategyFactory.create_strategy(strategy_type)
        
        strategy = self.ai_strategies[game_id]
        
        # Choisir une cible
        target = strategy.choose_target(opponent_grid, previous_moves)
        
        return target

# Instance globale
game_engine = GameEngine()