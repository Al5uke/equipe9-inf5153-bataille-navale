"""Tests unitaires pour le module GameEngine"""
import pytest
import uuid
from unittest.mock import Mock, patch, MagicMock
from game_logic.game import GameEngine
from game_logic.grid import GridManager
from game_logic.ship import ShipManager

class TestGameEngine:
    """Tests pour la classe GameEngine"""

    @patch('game_logic.game.db')
    def test_create_game_human_vs_ai_random(self, mock_db):
        """Test création d'une partie contre l'IA aléatoire"""
        mock_db.execute_insert = Mock()
        mock_db.execute_query = Mock(return_value=[])

        engine = GameEngine()
        game_id = engine.create_game('HUMAN_VS_AI_RANDOM', 'player1')

        # Vérifier qu'un game_id est retourné
        assert game_id is not None
        assert isinstance(game_id, str)

        # Vérifier que la DB a été appelée (pour créer la partie)
        assert mock_db.execute_insert.called

    @patch('game_logic.game.db')
    def test_create_game_human_vs_human(self, mock_db):
        """Test création d'une partie humain vs humain"""
        mock_db.execute_insert = Mock()
        mock_db.execute_query = Mock(return_value=[])

        engine = GameEngine()
        game_id = engine.create_game('HUMAN_VS_HUMAN', 'player1', 'player2')

        assert game_id is not None
        assert isinstance(game_id, str)

    @patch('game_logic.game.db')
    def test_create_grid(self, mock_db):
        """Test création d'une grille"""
        mock_db.execute_insert = Mock()

        engine = GameEngine()
        grid_id = engine._create_grid('game_123', 'player_456')

        assert grid_id is not None
        assert isinstance(grid_id, str)
        assert mock_db.execute_insert.called

    @patch('game_logic.game.db')
    def test_place_ships_success(self, mock_db):
        """Test placement réussi des navires"""
        # Mock des données de la grille
        empty_grid = GridManager.create_empty_grid()
        mock_db.execute_query = Mock(side_effect=[
            [{
                'id': 'grid_1',
                'grid_data': GridManager.serialize_grid(empty_grid)
            }],
            [{'count': 1}]  # Pour _check_both_players_ready
        ])
        mock_db.execute_insert = Mock()
        mock_db.execute_update = Mock()

        engine = GameEngine()
        ships_data = [
            {
                'ship_type': 'PORTE_AVION',
                'size': 5,
                'positions': ['A1', 'A2', 'A3', 'A4', 'A5'],
                'orientation': 'HORIZONTAL'
            },
            {
                'ship_type': 'CROISEUR',
                'size': 4,
                'positions': ['C1', 'C2', 'C3', 'C4'],
                'orientation': 'HORIZONTAL'
            }
        ]

        result = engine.place_ships('game_1', 'player_1', ships_data)

        assert result == True
        assert mock_db.execute_insert.called
        assert mock_db.execute_update.called

    @patch('game_logic.game.db')
    def test_place_ships_invalid_overlap(self, mock_db):
        """Test placement invalide avec chevauchement"""
        empty_grid = GridManager.create_empty_grid()
        mock_db.execute_query = Mock(return_value=[{
            'id': 'grid_1',
            'grid_data': GridManager.serialize_grid(empty_grid)
        }])

        engine = GameEngine()
        ships_data = [
            {
                'ship_type': 'PORTE_AVION',
                'size': 5,
                'positions': ['A1', 'A2', 'A3', 'A4', 'A5'],
                'orientation': 'HORIZONTAL'
            },
            {
                'ship_type': 'CROISEUR',
                'size': 4,
                'positions': ['A3', 'A4', 'A5', 'A6'],  # Chevauche le premier
                'orientation': 'HORIZONTAL'
            }
        ]

        result = engine.place_ships('game_1', 'player_1', ships_data)

        assert result == False

    @patch('game_logic.game.db')
    def test_place_ships_randomly(self, mock_db):
        """Test placement aléatoire des navires"""
        empty_grid = GridManager.create_empty_grid()
        mock_db.execute_query = Mock(side_effect=[
            [{
                'id': 'grid_1',
                'grid_data': GridManager.serialize_grid(empty_grid)
            }],
            [{'count': 1}]  # Pour _check_both_players_ready
        ])
        mock_db.execute_insert = Mock()
        mock_db.execute_update = Mock()

        engine = GameEngine()
        result = engine.place_ships_randomly('game_1', 'player_1')

        assert result == True
        # Vérifier que 5 navires ont été insérés
        assert mock_db.execute_insert.call_count == 5

    @patch('game_logic.game.db')
    def test_check_both_players_ready(self, mock_db):
        """Test vérification que les deux joueurs sont prêts"""
        # Simuler que les 2 joueurs ont placé leurs navires
        mock_db.execute_query = Mock(return_value=[{'count': 2}])
        mock_db.execute_update = Mock()

        engine = GameEngine()
        engine._check_both_players_ready('game_1')

        # Vérifier que le statut de la partie a été mis à jour
        assert mock_db.execute_update.called

    @patch('game_logic.game.db')
    def test_play_turn_hit(self, mock_db):
        """Test tour de jeu avec touché"""
        # Préparer une grille avec un navire
        grid = GridManager.create_empty_grid()
        grid['C3'] = 'SHIP'

        import json
        mock_db.execute_query = Mock(side_effect=[
            # Requête pour récupérer la partie
            [{
                'id': 'game_1',
                'current_turn': 'player_1',
                'status': 'IN_PROGRESS',
                'player1_id': 'player_1',
                'player2_id': 'player_2'
            }],
            # Requête pour la grille adverse
            [{
                'id': 'grid_1',
                'grid_data': GridManager.serialize_grid(grid)
            }],
            # Requête pour les navires (check_ship_sunk)
            [{
                'id': 'ship_1',
                'ship_type': 'CROISEUR',
                'positions': json.dumps(['C3', 'C4', 'C5', 'C6'])
            }],
            # Requête pour compter les moves
            [{'count': 0}],
            # Requête pour vérifier game over
            [{'total': 5, 'sunk': 0}]
        ])
        mock_db.execute_update = Mock()
        mock_db.execute_insert = Mock()

        engine = GameEngine()
        result = engine.play_turn('game_1', 'player_1', 'C3')

        assert 'result' in result
        assert result['result'] in ['HIT', 'SUNK']
        assert result['game_over'] == False

    @patch('game_logic.game.db')
    def test_play_turn_miss(self, mock_db):
        """Test tour de jeu avec raté"""
        grid = GridManager.create_empty_grid()

        mock_db.execute_query = Mock(side_effect=[
            [{
                'id': 'game_1',
                'current_turn': 'player_1',
                'status': 'IN_PROGRESS',
                'player1_id': 'player_1',
                'player2_id': 'player_2'
            }],
            [{
                'id': 'grid_1',
                'grid_data': GridManager.serialize_grid(grid)
            }],
            [{'count': 0}],
            [{'total': 5, 'sunk': 0}]
        ])
        mock_db.execute_update = Mock()
        mock_db.execute_insert = Mock()

        engine = GameEngine()
        result = engine.play_turn('game_1', 'player_1', 'D5')

        assert result['result'] == 'MISS'
        assert result['game_over'] == False

    @patch('game_logic.game.db')
    def test_play_turn_wrong_turn(self, mock_db):
        """Test tour de jeu quand ce n'est pas le tour du joueur"""
        mock_db.execute_query = Mock(return_value=[{
            'id': 'game_1',
            'current_turn': 'player_2',
            'status': 'IN_PROGRESS',
            'player1_id': 'player_1',
            'player2_id': 'player_2'
        }])

        engine = GameEngine()
        result = engine.play_turn('game_1', 'player_1', 'A1')

        assert 'error' in result
        assert "pas votre tour" in result['error']

    @patch('game_logic.game.db')
    def test_play_turn_game_not_in_progress(self, mock_db):
        """Test tour de jeu quand la partie n'est pas en cours"""
        mock_db.execute_query = Mock(return_value=[{
            'id': 'game_1',
            'current_turn': 'player_1',
            'status': 'FINISHED',
            'player1_id': 'player_1',
            'player2_id': 'player_2'
        }])

        engine = GameEngine()
        result = engine.play_turn('game_1', 'player_1', 'A1')

        assert 'error' in result
        assert "pas en cours" in result['error']

    @patch('game_logic.game.db')
    def test_play_turn_already_shot(self, mock_db):
        """Test tir sur une position déjà tirée"""
        grid = GridManager.create_empty_grid()
        grid['E5'] = 'MISS'  # Déjà tirée

        mock_db.execute_query = Mock(side_effect=[
            [{
                'id': 'game_1',
                'current_turn': 'player_1',
                'status': 'IN_PROGRESS',
                'player1_id': 'player_1',
                'player2_id': 'player_2'
            }],
            [{
                'id': 'grid_1',
                'grid_data': GridManager.serialize_grid(grid)
            }]
        ])

        engine = GameEngine()
        result = engine.play_turn('game_1', 'player_1', 'E5')

        assert 'error' in result
        assert "déjà tirée" in result['error']

    @patch('game_logic.game.db')
    def test_check_ship_sunk(self, mock_db):
        """Test vérification si un navire est coulé"""
        grid = GridManager.create_empty_grid()
        positions = ['F1', 'F2', 'F3']
        for pos in positions:
            grid[pos] = 'HIT'

        mock_db.execute_query = Mock(return_value=[{
            'id': 'ship_1',
            'ship_type': 'SOUS_MARIN',
            'positions': '["F1", "F2", "F3"]'
        }])
        mock_db.execute_update = Mock()

        engine = GameEngine()
        result = engine._check_ship_sunk('grid_1', 'F3', grid)

        assert result == 'SOUS_MARIN'
        assert mock_db.execute_update.called

    @patch('game_logic.game.db')
    def test_check_game_over_true(self, mock_db):
        """Test détection de fin de partie"""
        # Tous les navires sont coulés
        mock_db.execute_query = Mock(return_value=[{
            'total': 5,
            'sunk': 5
        }])

        engine = GameEngine()
        game_over, winner = engine._check_game_over('game_1', 'player_2', 'grid_2')

        assert game_over == True

    @patch('game_logic.game.db')
    def test_check_game_over_false(self, mock_db):
        """Test détection de partie non terminée"""
        mock_db.execute_query = Mock(return_value=[{
            'total': 5,
            'sunk': 3
        }])

        engine = GameEngine()
        game_over, winner = engine._check_game_over('game_1', 'player_2', 'grid_2')

        assert game_over == False

    @patch('game_logic.game.db')
    def test_get_ai_move_random(self, mock_db):
        """Test génération d'un coup pour l'IA aléatoire"""
        grid = GridManager.create_empty_grid()

        mock_db.execute_query = Mock(side_effect=[
            [{
                'id': 'game_1',
                'player1_id': 'player_1',
                'player2_id': 'ai_random'
            }],
            [{
                'grid_data': GridManager.serialize_grid(grid)
            }],
            []  # Pas de moves précédents
        ])

        engine = GameEngine()
        target = engine.get_ai_move('game_1', 'ai_random')

        assert target is not None
        assert GridManager.is_valid_position(target)

    @patch('game_logic.game.db')
    def test_get_ai_move_targeted(self, mock_db):
        """Test génération d'un coup pour l'IA ciblée"""
        grid = GridManager.create_empty_grid()

        mock_db.execute_query = Mock(side_effect=[
            [{
                'id': 'game_1',
                'player1_id': 'player_1',
                'player2_id': 'ai_targeted'
            }],
            [{
                'grid_data': GridManager.serialize_grid(grid)
            }],
            []
        ])

        engine = GameEngine()
        target = engine.get_ai_move('game_1', 'ai_targeted')

        assert target is not None
        assert GridManager.is_valid_position(target)

    @patch('game_logic.game.db')
    def test_update_player_stats(self, mock_db):
        """Test mise à jour des statistiques des joueurs"""
        mock_db.execute_update = Mock()
        mock_db.execute_query = Mock(return_value=[
            {
                'player_id': 'player_1',
                'total': 10,
                'hits': 6
            },
            {
                'player_id': 'player_2',
                'total': 12,
                'hits': 5
            }
        ])

        engine = GameEngine()
        engine._update_player_stats('player_1', 'player_2', 'game_1')

        # Vérifier que les updates ont été appelés
        assert mock_db.execute_update.called
        # Au moins 2 updates (victoire + défaite)
        assert mock_db.execute_update.call_count >= 2
