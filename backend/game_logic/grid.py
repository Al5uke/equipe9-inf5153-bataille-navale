"""Logique de gestion de la grille 10x10"""
import json
from typing import List, Dict, Tuple, Optional

class GridManager:
    """Gestionnaire de grille 10x10 pour la bataille navale"""
    
    ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
    COLS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
    
    @staticmethod
    def create_empty_grid() -> Dict[str, str]:
        """Crée une grille vide 10x10"""
        grid = {}
        for row in GridManager.ROWS:
            for col in GridManager.COLS:
                grid[f"{row}{col}"] = "EMPTY"
        return grid
    
    @staticmethod
    def is_valid_position(position: str) -> bool:
        """Vérifie si une position est valide (ex: A1, J10)"""
        if len(position) < 2 or len(position) > 3:
            return False
        
        row = position[0]
        col = position[1:]
        
        return row in GridManager.ROWS and col in GridManager.COLS
    
    @staticmethod
    def get_adjacent_positions(position: str) -> List[str]:
        """Retourne les positions adjacentes (haut, bas, gauche, droite)"""
        if not GridManager.is_valid_position(position):
            return []
        
        row = position[0]
        col = position[1:]
        
        row_idx = GridManager.ROWS.index(row)
        col_idx = GridManager.COLS.index(col)
        
        adjacent = []
        
        # Haut
        if row_idx > 0:
            adjacent.append(f"{GridManager.ROWS[row_idx - 1]}{col}")
        # Bas
        if row_idx < len(GridManager.ROWS) - 1:
            adjacent.append(f"{GridManager.ROWS[row_idx + 1]}{col}")
        # Gauche
        if col_idx > 0:
            adjacent.append(f"{row}{GridManager.COLS[col_idx - 1]}")
        # Droite
        if col_idx < len(GridManager.COLS) - 1:
            adjacent.append(f"{row}{GridManager.COLS[col_idx + 1]}")
        
        return adjacent
    
    @staticmethod
    def can_place_ship(grid: Dict[str, str], positions: List[str]) -> bool:
        """Vérifie si un navire peut être placé aux positions données"""
        # Vérifier que toutes les positions sont valides
        for pos in positions:
            if not GridManager.is_valid_position(pos):
                return False
            
            # Vérifier que la case est vide
            if grid.get(pos) != "EMPTY":
                return False
        
        # Vérifier que les positions sont alignées (horizontalement ou verticalement)
        if len(positions) > 1:
            rows = [p[0] for p in positions]
            cols = [p[1:] for p in positions]
            
            # Toutes les lignes identiques (horizontal) OU toutes les colonnes identiques (vertical)
            if not (len(set(rows)) == 1 or len(set(cols)) == 1):
                return False
            
            # Vérifier que les positions sont consécutives
            if len(set(rows)) == 1:  # Horizontal
                col_indices = sorted([GridManager.COLS.index(c) for c in cols])
                for i in range(len(col_indices) - 1):
                    if col_indices[i + 1] - col_indices[i] != 1:
                        return False
            else:  # Vertical
                row_indices = sorted([GridManager.ROWS.index(r) for r in rows])
                for i in range(len(row_indices) - 1):
                    if row_indices[i + 1] - row_indices[i] != 1:
                        return False
        
        return True
    
    @staticmethod
    def place_ship(grid: Dict[str, str], positions: List[str]) -> bool:
        """Place un navire sur la grille"""
        if not GridManager.can_place_ship(grid, positions):
            return False
        
        for pos in positions:
            grid[pos] = "SHIP"
        
        return True
    
    @staticmethod
    def process_shot(grid: Dict[str, str], position: str) -> Tuple[str, bool]:
        """
        Traite un tir sur la grille
        Retourne: (résultat, position_déjà_tirée)
        Résultats possibles: 'HIT', 'MISS'
        """
        if not GridManager.is_valid_position(position):
            return "INVALID", False
        
        cell_state = grid.get(position)
        
        # Position déjà tirée
        if cell_state in ["HIT", "MISS"]:
            return cell_state, True
        
        # Tir sur un navire
        if cell_state == "SHIP":
            grid[position] = "HIT"
            return "HIT", False
        
        # Tir dans l'eau
        if cell_state == "EMPTY":
            grid[position] = "MISS"
            return "MISS", False
        
        return "INVALID", False
    
    @staticmethod
    def serialize_grid(grid: Dict[str, str]) -> str:
        """Sérialise la grille en JSON pour stockage en DB"""
        return json.dumps(grid)
    
    @staticmethod
    def deserialize_grid(grid_json: str) -> Dict[str, str]:
        """Désérialise la grille depuis JSON"""
        return json.loads(grid_json)