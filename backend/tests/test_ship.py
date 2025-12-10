"""Tests unitaires pour le module ShipManager"""
import pytest
from game_logic.ship import ShipManager
from game_logic.grid import GridManager

class TestShipManager:
    """Tests pour la classe ShipManager"""

    def test_ship_types_constants(self):
        """Test que les types de navires sont bien définis"""
        assert ShipManager.SHIP_TYPES['PORTE_AVION'] == 5
        assert ShipManager.SHIP_TYPES['CROISEUR'] == 4
        assert ShipManager.SHIP_TYPES['SOUS_MARIN'] == 3
        assert ShipManager.SHIP_TYPES['CONTRE_TORPILLEUR'] == 3
        assert ShipManager.SHIP_TYPES['TORPILLEUR'] == 2

    def test_get_ship_positions_horizontal(self):
        """Test calcul des positions d'un navire horizontal"""
        positions = ShipManager.get_ship_positions('A1', 5, 'HORIZONTAL')

        assert len(positions) == 5
        assert positions == ['A1', 'A2', 'A3', 'A4', 'A5']

    def test_get_ship_positions_vertical(self):
        """Test calcul des positions d'un navire vertical"""
        positions = ShipManager.get_ship_positions('B2', 4, 'VERTICAL')

        assert len(positions) == 4
        assert positions == ['B2', 'C2', 'D2', 'E2']

    def test_get_ship_positions_out_of_bounds_horizontal(self):
        """Test navire horizontal dépassant la grille"""
        positions = ShipManager.get_ship_positions('A8', 5, 'HORIZONTAL')

        # Devrait retourner une liste vide (dépasse la colonne 10)
        assert positions == []

    def test_get_ship_positions_out_of_bounds_vertical(self):
        """Test navire vertical dépassant la grille"""
        positions = ShipManager.get_ship_positions('H1', 5, 'VERTICAL')

        # Devrait retourner une liste vide (dépasse la ligne J)
        assert positions == []

    def test_generate_random_ship_placement(self, empty_grid):
        """Test génération aléatoire d'un placement de navire"""
        positions, orientation = ShipManager.generate_random_ship_placement(
            empty_grid, 'PORTE_AVION', 5
        )

        # Devrait retourner des positions valides
        assert len(positions) == 5
        assert orientation in ['HORIZONTAL', 'VERTICAL']

        # Vérifier que le placement est valide
        assert GridManager.can_place_ship(empty_grid, positions) == True

    def test_place_all_ships_randomly(self, empty_grid):
        """Test placement aléatoire de tous les navires"""
        ships_data = ShipManager.place_all_ships_randomly(empty_grid)

        # Devrait avoir placé 5 navires
        assert len(ships_data) == 5

        # Vérifier que tous les types sont présents
        ship_types = [ship['ship_type'] for ship in ships_data]
        assert 'PORTE_AVION' in ship_types
        assert 'CROISEUR' in ship_types
        assert 'SOUS_MARIN' in ship_types
        assert 'CONTRE_TORPILLEUR' in ship_types
        assert 'TORPILLEUR' in ship_types

        # Vérifier qu'aucun navire ne se chevauche
        all_positions = []
        for ship in ships_data:
            all_positions.extend(ship['positions'])

        # Pas de doublons = pas de chevauchement
        assert len(all_positions) == len(set(all_positions))

    def test_check_if_ship_sunk_true(self, empty_grid):
        """Test détection d'un navire coulé"""
        positions = ['D1', 'D2', 'D3']
        GridManager.place_ship(empty_grid, positions)

        # Toucher toutes les positions
        for pos in positions:
            empty_grid[pos] = 'HIT'

        assert ShipManager.check_if_ship_sunk(positions, empty_grid) == True

    def test_check_if_ship_sunk_false(self, empty_grid):
        """Test détection d'un navire non coulé"""
        positions = ['E1', 'E2', 'E3', 'E4']
        GridManager.place_ship(empty_grid, positions)

        # Toucher seulement certaines positions
        empty_grid['E1'] = 'HIT'
        empty_grid['E3'] = 'HIT'

        assert ShipManager.check_if_ship_sunk(positions, empty_grid) == False

    def test_get_all_ships_status(self, empty_grid):
        """Test récupération du statut de tous les navires"""
        ships = [
            {
                'ship_type': 'CROISEUR',
                'positions': ['F1', 'F2', 'F3', 'F4']
            },
            {
                'ship_type': 'TORPILLEUR',
                'positions': ['H5', 'H6']
            }
        ]

        # Placer les navires
        for ship in ships:
            GridManager.place_ship(empty_grid, ship['positions'])

        # Toucher certaines positions
        empty_grid['F1'] = 'HIT'
        empty_grid['F2'] = 'HIT'
        empty_grid['H5'] = 'HIT'
        empty_grid['H6'] = 'HIT'

        # Obtenir les statuts
        ships_status = ShipManager.get_all_ships_status(ships, empty_grid)

        assert ships_status[0]['hits'] == 2
        assert ships_status[0]['is_sunk'] == False
        assert ships_status[1]['hits'] == 2
        assert ships_status[1]['is_sunk'] == True

    def test_are_all_ships_sunk_true(self, empty_grid):
        """Test détection de tous les navires coulés"""
        ships = [
            {'positions': ['A1', 'A2']},
            {'positions': ['C1', 'C2', 'C3']}
        ]

        for ship in ships:
            GridManager.place_ship(empty_grid, ship['positions'])

        # Couler tous les navires
        for ship in ships:
            for pos in ship['positions']:
                empty_grid[pos] = 'HIT'

        assert ShipManager.are_all_ships_sunk(ships, empty_grid) == True

    def test_are_all_ships_sunk_false(self, empty_grid):
        """Test détection de navires non tous coulés"""
        ships = [
            {'positions': ['A1', 'A2']},
            {'positions': ['C1', 'C2', 'C3']}
        ]

        for ship in ships:
            GridManager.place_ship(empty_grid, ship['positions'])

        # Couler seulement le premier navire
        for pos in ships[0]['positions']:
            empty_grid[pos] = 'HIT'

        assert ShipManager.are_all_ships_sunk(ships, empty_grid) == False
