"""Configuration et fixtures Pytest pour les tests"""
import pytest
import sys
import os
from pathlib import Path

# Ajouter le répertoire backend au path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

import json
from database import db
from game_logic.game import GameEngine
from game_logic.grid import GridManager
from game_logic.ship import ShipManager

@pytest.fixture
def sample_player_data():
    """Données d'exemple pour un joueur"""
    return {
        'id': 'test_player_1',
        'name': 'Test Player',
        'email': 'test@example.com'
    }

@pytest.fixture
def sample_game_data():
    """Données d'exemple pour une partie"""
    return {
        'mode': 'HUMAN_VS_AI_RANDOM',
        'player1_id': 'test_player_1',
        'player2_id': 'ai_random'
    }

@pytest.fixture
def empty_grid():
    """Grille vide 10x10"""
    return GridManager.create_empty_grid()

@pytest.fixture
def sample_ship_positions():
    """Positions d'exemple pour un navire"""
    return {
        'horizontal': ['A1', 'A2', 'A3', 'A4', 'A5'],
        'vertical': ['B1', 'C1', 'D1', 'E1', 'F1']
    }

@pytest.fixture
def game_engine():
    """Instance du moteur de jeu"""
    return GameEngine()

@pytest.fixture
def mock_opponent_grid():
    """Grille adversaire avec quelques navires placés"""
    grid = GridManager.create_empty_grid()
    # Placer un navire horizontal en A1-A5
    for col in ['1', '2', '3', '4', '5']:
        grid[f'A{col}'] = 'SHIP'
    # Placer un navire vertical en C3-C5
    for row in ['C', 'D', 'E']:
        grid[f'{row}3'] = 'SHIP'
    return grid

@pytest.fixture
def sample_ships_data():
    """Données d'exemple pour un ensemble complet de navires"""
    return [
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
        },
        {
            'ship_type': 'SOUS_MARIN',
            'size': 3,
            'positions': ['E1', 'E2', 'E3'],
            'orientation': 'HORIZONTAL'
        },
        {
            'ship_type': 'CONTRE_TORPILLEUR',
            'size': 3,
            'positions': ['G1', 'G2', 'G3'],
            'orientation': 'HORIZONTAL'
        },
        {
            'ship_type': 'TORPILLEUR',
            'size': 2,
            'positions': ['I1', 'I2'],
            'orientation': 'HORIZONTAL'
        }
    ]
