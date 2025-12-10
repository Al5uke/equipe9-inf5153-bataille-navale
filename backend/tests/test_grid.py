"""Tests unitaires pour le module GridManager"""
import pytest
from game_logic.grid import GridManager

class TestGridManager:
    """Tests pour la classe GridManager"""

    def test_create_empty_grid(self):
        """Test création d'une grille vide 10x10"""
        grid = GridManager.create_empty_grid()

        # Vérifier qu'il y a 100 cases
        assert len(grid) == 100

        # Vérifier que toutes les cases sont vides
        for cell_state in grid.values():
            assert cell_state == "EMPTY"

        # Vérifier quelques positions spécifiques
        assert 'A1' in grid
        assert 'J10' in grid
        assert 'E5' in grid

    def test_is_valid_position_valid(self):
        """Test validation de positions valides"""
        assert GridManager.is_valid_position('A1') == True
        assert GridManager.is_valid_position('J10') == True
        assert GridManager.is_valid_position('E5') == True
        assert GridManager.is_valid_position('B2') == True

    def test_is_valid_position_invalid(self):
        """Test validation de positions invalides"""
        assert GridManager.is_valid_position('K1') == False  # Ligne invalide
        assert GridManager.is_valid_position('A11') == False  # Colonne invalide
        assert GridManager.is_valid_position('Z99') == False
        assert GridManager.is_valid_position('') == False
        assert GridManager.is_valid_position('1A') == False  # Ordre inversé

    def test_get_adjacent_positions_center(self):
        """Test récupération des positions adjacentes (centre de la grille)"""
        adjacent = GridManager.get_adjacent_positions('E5')

        assert len(adjacent) == 4
        assert 'D5' in adjacent  # Haut
        assert 'F5' in adjacent  # Bas
        assert 'E4' in adjacent  # Gauche
        assert 'E6' in adjacent  # Droite

    def test_get_adjacent_positions_corner(self):
        """Test récupération des positions adjacentes (coin)"""
        adjacent = GridManager.get_adjacent_positions('A1')

        assert len(adjacent) == 2
        assert 'B1' in adjacent  # Bas
        assert 'A2' in adjacent  # Droite

    def test_get_adjacent_positions_edge(self):
        """Test récupération des positions adjacentes (bord)"""
        adjacent = GridManager.get_adjacent_positions('A5')

        assert len(adjacent) == 3
        assert 'B5' in adjacent  # Bas
        assert 'A4' in adjacent  # Gauche
        assert 'A6' in adjacent  # Droite

    def test_can_place_ship_valid_horizontal(self, empty_grid):
        """Test placement valide d'un navire horizontal"""
        positions = ['A1', 'A2', 'A3', 'A4', 'A5']
        assert GridManager.can_place_ship(empty_grid, positions) == True

    def test_can_place_ship_valid_vertical(self, empty_grid):
        """Test placement valide d'un navire vertical"""
        positions = ['A1', 'B1', 'C1', 'D1', 'E1']
        assert GridManager.can_place_ship(empty_grid, positions) == True

    def test_can_place_ship_invalid_overlap(self, empty_grid):
        """Test placement invalide avec chevauchement"""
        positions1 = ['A1', 'A2', 'A3']
        GridManager.place_ship(empty_grid, positions1)

        positions2 = ['A3', 'A4', 'A5']  # Chevauche A3
        assert GridManager.can_place_ship(empty_grid, positions2) == False

    def test_can_place_ship_invalid_diagonal(self, empty_grid):
        """Test placement invalide (diagonal)"""
        positions = ['A1', 'B2', 'C3']  # Diagonal
        assert GridManager.can_place_ship(empty_grid, positions) == False

    def test_can_place_ship_invalid_non_consecutive(self, empty_grid):
        """Test placement invalide (positions non consécutives)"""
        positions = ['A1', 'A3', 'A5']  # Pas consécutif
        assert GridManager.can_place_ship(empty_grid, positions) == False

    def test_place_ship_success(self, empty_grid):
        """Test placement réussi d'un navire"""
        positions = ['B2', 'B3', 'B4']
        result = GridManager.place_ship(empty_grid, positions)

        assert result == True
        for pos in positions:
            assert empty_grid[pos] == 'SHIP'

    def test_process_shot_hit(self, empty_grid):
        """Test tir réussi (touché)"""
        # Placer un navire
        positions = ['C3', 'C4', 'C5']
        GridManager.place_ship(empty_grid, positions)

        # Tirer sur le navire
        result, already_shot = GridManager.process_shot(empty_grid, 'C4')

        assert result == 'HIT'
        assert already_shot == False
        assert empty_grid['C4'] == 'HIT'

    def test_process_shot_miss(self, empty_grid):
        """Test tir manqué (dans l'eau)"""
        result, already_shot = GridManager.process_shot(empty_grid, 'D5')

        assert result == 'MISS'
        assert already_shot == False
        assert empty_grid['D5'] == 'MISS'

    def test_process_shot_already_shot(self, empty_grid):
        """Test tir sur une position déjà tirée"""
        # Premier tir
        GridManager.process_shot(empty_grid, 'E6')

        # Deuxième tir sur la même position
        result, already_shot = GridManager.process_shot(empty_grid, 'E6')

        assert already_shot == True

    def test_serialize_deserialize_grid(self, empty_grid):
        """Test sérialisation/désérialisation de la grille"""
        # Modifier la grille
        empty_grid['A1'] = 'SHIP'
        empty_grid['B2'] = 'HIT'
        empty_grid['C3'] = 'MISS'

        # Sérialiser
        serialized = GridManager.serialize_grid(empty_grid)
        assert isinstance(serialized, str)

        # Désérialiser
        deserialized = GridManager.deserialize_grid(serialized)

        # Vérifier que c'est identique
        assert deserialized == empty_grid
        assert deserialized['A1'] == 'SHIP'
        assert deserialized['B2'] == 'HIT'
        assert deserialized['C3'] == 'MISS'
