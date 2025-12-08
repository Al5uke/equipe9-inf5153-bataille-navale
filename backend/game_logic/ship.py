"""Logique de gestion des navires"""
import random
from typing import List, Dict, Tuple
from game_logic.grid import GridManager

class ShipManager:
    """Gestionnaire des navires"""
    
    # Types de navires avec leurs tailles
    SHIP_TYPES = {
        'PORTE_AVION': 5,
        'CROISEUR': 4,
        'SOUS_MARIN': 3,
        'CONTRE_TORPILLEUR': 3,
        'TORPILLEUR': 2
    }
    
    @staticmethod
    def get_ship_positions(start_pos: str, size: int, orientation: str) -> List[str]:
        """
        Calcule les positions d'un navire
        start_pos: position de départ (ex: 'A1')
        size: taille du navire
        orientation: 'HORIZONTAL' ou 'VERTICAL'
        """
        if not GridManager.is_valid_position(start_pos):
            return []
        
        row = start_pos[0]
        col = start_pos[1:]
        
        positions = [start_pos]
        
        if orientation == 'HORIZONTAL':
            col_idx = GridManager.COLS.index(col)
            for i in range(1, size):
                new_col_idx = col_idx + i
                if new_col_idx >= len(GridManager.COLS):
                    return []  # Dépasse la grille
                positions.append(f"{row}{GridManager.COLS[new_col_idx]}")
        
        elif orientation == 'VERTICAL':
            row_idx = GridManager.ROWS.index(row)
            for i in range(1, size):
                new_row_idx = row_idx + i
                if new_row_idx >= len(GridManager.ROWS):
                    return []  # Dépasse la grille
                positions.append(f"{GridManager.ROWS[new_row_idx]}{col}")
        
        return positions
    
    @staticmethod
    def generate_random_ship_placement(grid: Dict[str, str], ship_type: str, size: int) -> Tuple[List[str], str]:
        """
        Génère un placement aléatoire pour un navire
        Retourne: (positions, orientation)
        """
        max_attempts = 100
        
        for _ in range(max_attempts):
            # Choisir une orientation aléatoire
            orientation = random.choice(['HORIZONTAL', 'VERTICAL'])
            
            # Choisir une position de départ aléatoire
            row = random.choice(GridManager.ROWS)
            col = random.choice(GridManager.COLS)
            start_pos = f"{row}{col}"
            
            # Calculer les positions du navire
            positions = ShipManager.get_ship_positions(start_pos, size, orientation)
            
            # Vérifier si le placement est valide
            if positions and GridManager.can_place_ship(grid, positions):
                return positions, orientation
        
        return [], ''
    
    @staticmethod
    def place_all_ships_randomly(grid: Dict[str, str]) -> List[Dict]:
        """
        Place tous les navires aléatoirement sur la grille
        Retourne la liste des navires placés
        """
        ships_data = []
        
        for ship_type, size in ShipManager.SHIP_TYPES.items():
            positions, orientation = ShipManager.generate_random_ship_placement(grid, ship_type, size)
            
            if positions:
                GridManager.place_ship(grid, positions)
                ships_data.append({
                    'ship_type': ship_type,
                    'size': size,
                    'positions': positions,
                    'orientation': orientation
                })
        
        return ships_data
    
    @staticmethod
    def check_if_ship_sunk(ship_positions: List[str], grid: Dict[str, str]) -> bool:
        """
        Vérifie si un navire est coulé
        Un navire est coulé si toutes ses positions sont 'HIT'
        """
        for pos in ship_positions:
            if grid.get(pos) != "HIT":
                return False
        return True
    
    @staticmethod
    def get_all_ships_status(ships: List[Dict], grid: Dict[str, str]) -> List[Dict]:
        """
        Retourne le statut de tous les navires (touchés, coulés)
        """
        ships_status = []
        
        for ship in ships:
            positions = ship['positions']
            hits = sum(1 for pos in positions if grid.get(pos) == 'HIT')
            is_sunk = ShipManager.check_if_ship_sunk(positions, grid)
            
            ships_status.append({
                **ship,
                'hits': hits,
                'is_sunk': is_sunk
            })
        
        return ships_status
    
    @staticmethod
    def are_all_ships_sunk(ships: List[Dict], grid: Dict[str, str]) -> bool:
        """Vérifie si tous les navires sont coulés"""
        for ship in ships:
            if not ShipManager.check_if_ship_sunk(ship['positions'], grid):
                return False
        return True