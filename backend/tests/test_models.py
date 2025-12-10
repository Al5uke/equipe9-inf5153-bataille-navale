"""Tests unitaires pour les modèles de données"""
import pytest
from models import Player, Ship, Grid, Game, Move, LeaderboardEntry
from models import SHIP_TYPES, CELL_STATES, GAME_MODES, GAME_STATUS

class TestPlayerModel:
    """Tests pour le modèle Player"""

    def test_player_creation(self):
        """Test création d'un joueur"""
        player = Player(
            id='player_123',
            name='Test Player',
            email='test@example.com',
            victories=5,
            defeats=2
        )

        assert player.id == 'player_123'
        assert player.name == 'Test Player'
        assert player.email == 'test@example.com'
        assert player.victories == 5
        assert player.defeats == 2

    def test_player_to_dict(self):
        """Test conversion d'un joueur en dictionnaire"""
        player = Player(
            id='player_456',
            name='Another Player',
            victories=10
        )

        player_dict = player.to_dict()

        assert player_dict['id'] == 'player_456'
        assert player_dict['name'] == 'Another Player'
        assert player_dict['victories'] == 10
        assert 'email' in player_dict


class TestShipModel:
    """Tests pour le modèle Ship"""

    def test_ship_creation(self):
        """Test création d'un navire"""
        ship = Ship(
            id='ship_1',
            grid_id='grid_1',
            ship_type='PORTE_AVION',
            size=5,
            positions=['A1', 'A2', 'A3', 'A4', 'A5'],
            orientation='HORIZONTAL',
            hits=2,
            is_sunk=False
        )

        assert ship.id == 'ship_1'
        assert ship.ship_type == 'PORTE_AVION'
        assert ship.size == 5
        assert len(ship.positions) == 5
        assert ship.orientation == 'HORIZONTAL'
        assert ship.hits == 2
        assert ship.is_sunk == False

    def test_ship_to_dict(self):
        """Test conversion d'un navire en dictionnaire"""
        ship = Ship(
            id='ship_2',
            grid_id='grid_2',
            ship_type='CROISEUR',
            size=4,
            positions=['B1', 'B2', 'B3', 'B4'],
            orientation='HORIZONTAL'
        )

        ship_dict = ship.to_dict()

        assert ship_dict['ship_type'] == 'CROISEUR'
        assert ship_dict['size'] == 4
        assert len(ship_dict['positions']) == 4


class TestGridModel:
    """Tests pour le modèle Grid"""

    def test_grid_creation(self):
        """Test création d'une grille"""
        grid = Grid(
            id='grid_123',
            game_id='game_456',
            player_id='player_789',
            grid_data={'A1': 'EMPTY', 'B2': 'SHIP'},
            ships_placed=True
        )

        assert grid.id == 'grid_123'
        assert grid.game_id == 'game_456'
        assert grid.player_id == 'player_789'
        assert grid.ships_placed == True
        assert 'A1' in grid.grid_data

    def test_grid_to_dict(self):
        """Test conversion d'une grille en dictionnaire"""
        grid = Grid(
            id='grid_1',
            game_id='game_1',
            player_id='player_1',
            grid_data={'C3': 'HIT'}
        )

        grid_dict = grid.to_dict()

        assert 'id' in grid_dict
        assert 'grid_data' in grid_dict
        assert grid_dict['ships_placed'] == False


class TestGameModel:
    """Tests pour le modèle Game"""

    def test_game_creation(self):
        """Test création d'une partie"""
        game = Game(
            id='game_999',
            mode='HUMAN_VS_AI_RANDOM',
            player1_id='player_1',
            player2_id='ai_random',
            status='IN_PROGRESS'
        )

        assert game.id == 'game_999'
        assert game.mode == 'HUMAN_VS_AI_RANDOM'
        assert game.player1_id == 'player_1'
        assert game.player2_id == 'ai_random'
        assert game.status == 'IN_PROGRESS'

    def test_game_to_dict(self):
        """Test conversion d'une partie en dictionnaire"""
        game = Game(
            id='game_2',
            mode='HUMAN_VS_HUMAN',
            player1_id='p1',
            player2_id='p2'
        )

        game_dict = game.to_dict()

        assert game_dict['mode'] == 'HUMAN_VS_HUMAN'
        assert 'status' in game_dict


class TestMoveModel:
    """Tests pour le modèle Move"""

    def test_move_creation(self):
        """Test création d'un coup"""
        move = Move(
            id='move_1',
            game_id='game_1',
            player_id='player_1',
            target_position='D5',
            result='HIT',
            move_number=1
        )

        assert move.id == 'move_1'
        assert move.target_position == 'D5'
        assert move.result == 'HIT'
        assert move.move_number == 1

    def test_move_to_dict(self):
        """Test conversion d'un coup en dictionnaire"""
        move = Move(
            id='move_2',
            game_id='game_2',
            player_id='player_2',
            target_position='A1',
            result='MISS',
            move_number=5
        )

        move_dict = move.to_dict()

        assert move_dict['result'] == 'MISS'
        assert move_dict['move_number'] == 5


class TestConstants:
    """Tests pour les constantes"""

    def test_ship_types_constant(self):
        """Test constante SHIP_TYPES"""
        assert SHIP_TYPES['PORTE_AVION'] == 5
        assert SHIP_TYPES['CROISEUR'] == 4
        assert SHIP_TYPES['TORPILLEUR'] == 2

    def test_cell_states_constant(self):
        """Test constante CELL_STATES"""
        assert CELL_STATES['EMPTY'] == 'EMPTY'
        assert CELL_STATES['SHIP'] == 'SHIP'
        assert CELL_STATES['HIT'] == 'HIT'
        assert CELL_STATES['MISS'] == 'MISS'

    def test_game_modes_constant(self):
        """Test constante GAME_MODES"""
        assert 'HUMAN_VS_HUMAN' in GAME_MODES
        assert 'HUMAN_VS_AI_RANDOM' in GAME_MODES
        assert 'HUMAN_VS_AI_TARGETED' in GAME_MODES

    def test_game_status_constant(self):
        """Test constante GAME_STATUS"""
        assert GAME_STATUS['WAITING'] == 'WAITING'
        assert GAME_STATUS['PLACING_SHIPS'] == 'PLACING_SHIPS'
        assert GAME_STATUS['IN_PROGRESS'] == 'IN_PROGRESS'
        assert GAME_STATUS['FINISHED'] == 'FINISHED'
