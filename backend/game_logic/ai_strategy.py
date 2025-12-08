"""Stratégies d'IA pour la bataille navale

Modèle Strategy (patron de conception GoF)
- AIStrategy: Interface de stratégie
- RandomStrategy: Stratégie aléatoire (niveau débutant)
- TargetedStrategy: Stratégie ciblée (niveau avancé)
"""
import random
from typing import List, Dict, Optional
from abc import ABC, abstractmethod
from game_logic.grid import GridManager

class AIStrategy(ABC):
    """Interface de stratégie pour l'IA (patron Strategy)"""
    
    @abstractmethod
    def choose_target(self, opponent_grid: Dict[str, str], previous_moves: List[Dict]) -> str:
        """
        Choisit une position cible pour tirer
        opponent_grid: grille de l'adversaire (vue par l'IA)
        previous_moves: liste des coups précédents
        Retourne: position cible (ex: 'A5')
        """
        pass

class RandomStrategy(AIStrategy):
    """Stratégie aléatoire - Niveau débutant"""
    
    def choose_target(self, opponent_grid: Dict[str, str], previous_moves: List[Dict]) -> str:
        """
        Choisit une position aléatoire parmi les cases non tirées
        """
        # Récupérer toutes les positions non tirées
        available_positions = [
            pos for pos, state in opponent_grid.items()
            if state not in ['HIT', 'MISS']
        ]
        
        if not available_positions:
            # Toutes les cases ont été tirées (ne devrait pas arriver)
            return f"{random.choice(GridManager.ROWS)}{random.choice(GridManager.COLS)}"
        
        return random.choice(available_positions)

class TargetedStrategy(AIStrategy):
    """Stratégie ciblée - Niveau avancé
    
    Après un premier tir réussi, l'IA explore les cases adjacentes
    pour trouver et couler complètement le navire.
    """
    
    def __init__(self):
        self.target_mode = False  # Mode ciblage actif
        self.target_positions = []  # Positions à explorer
        self.hit_positions = []  # Positions touchées du navire en cours
    
    def choose_target(self, opponent_grid: Dict[str, str], previous_moves: List[Dict]) -> str:
        """
        Stratégie avancée:
        1. Si aucun navire touché: tir aléatoire intelligent (pattern en damier)
        2. Si navire touché: explorer les cases adjacentes
        3. Si navire coulé: retour au mode aléatoire
        """
        # Mettre à jour l'état basé sur le dernier coup
        self._update_state(previous_moves, opponent_grid)
        
        # Mode ciblage: explorer les positions adjacentes aux touches
        if self.target_mode and self.target_positions:
            # Filtrer les positions déjà tirées
            valid_targets = [
                pos for pos in self.target_positions
                if opponent_grid.get(pos) not in ['HIT', 'MISS']
            ]
            
            if valid_targets:
                target = valid_targets[0]
                self.target_positions.remove(target)
                return target
        
        # Mode aléatoire intelligent: pattern en damier pour être plus efficace
        return self._choose_smart_random(opponent_grid)
    
    def _update_state(self, previous_moves: List[Dict], opponent_grid: Dict[str, str]):
        """Met à jour l'état de la stratégie basé sur les coups précédents"""
        if not previous_moves:
            return
        
        last_move = previous_moves[-1]
        
        # Si le dernier coup a touché
        if last_move['result'] == 'HIT':
            position = last_move['target_position']
            self.hit_positions.append(position)
            
            # Activer le mode ciblage
            self.target_mode = True
            
            # Ajouter les positions adjacentes à explorer
            adjacent = GridManager.get_adjacent_positions(position)
            for adj_pos in adjacent:
                if adj_pos not in self.target_positions:
                    self.target_positions.append(adj_pos)
            
            # Si on a plusieurs touches, déterminer la direction
            if len(self.hit_positions) >= 2:
                self._refine_targets()
        
        # Si le dernier coup a coulé le navire
        elif last_move['result'] == 'SUNK':
            # Réinitialiser pour chercher un nouveau navire
            self.target_mode = False
            self.target_positions = []
            self.hit_positions = []
    
    def _refine_targets(self):
        """
        Affine les cibles en déterminant la direction du navire
        (horizontal ou vertical)
        """
        if len(self.hit_positions) < 2:
            return
        
        # Déterminer si le navire est horizontal ou vertical
        rows = [pos[0] for pos in self.hit_positions]
        cols = [pos[1:] for pos in self.hit_positions]
        
        if len(set(rows)) == 1:  # Navire horizontal
            # Garder seulement les cibles sur la même ligne
            row = rows[0]
            self.target_positions = [
                pos for pos in self.target_positions
                if pos[0] == row
            ]
        
        elif len(set(cols)) == 1:  # Navire vertical
            # Garder seulement les cibles sur la même colonne
            col = cols[0]
            self.target_positions = [
                pos for pos in self.target_positions
                if pos[1:] == col
            ]
    
    def _choose_smart_random(self, opponent_grid: Dict[str, str]) -> str:
        """
        Choisit une position aléatoire en utilisant un pattern en damier
        pour être plus efficace (car les navires font au minimum 2 cases)
        """
        # Pattern en damier: cases dont la somme (row_idx + col_idx) est paire
        checkerboard_positions = []
        
        for row_idx, row in enumerate(GridManager.ROWS):
            for col_idx, col in enumerate(GridManager.COLS):
                pos = f"{row}{col}"
                if opponent_grid.get(pos) not in ['HIT', 'MISS']:
                    if (row_idx + col_idx) % 2 == 0:
                        checkerboard_positions.append(pos)
        
        # Si le pattern en damier n'a plus de cases, prendre n'importe quelle case
        if not checkerboard_positions:
            available_positions = [
                pos for pos, state in opponent_grid.items()
                if state not in ['HIT', 'MISS']
            ]
            return random.choice(available_positions) if available_positions else 'A1'
        
        return random.choice(checkerboard_positions)

class AIStrategyFactory:
    """Factory pour créer les stratégies d'IA (patron Factory)"""
    
    @staticmethod
    def create_strategy(strategy_type: str) -> AIStrategy:
        """
        Crée une stratégie d'IA
        strategy_type: 'RANDOM' ou 'TARGETED'
        """
        if strategy_type == 'RANDOM':
            return RandomStrategy()
        elif strategy_type == 'TARGETED':
            return TargetedStrategy()
        else:
            raise ValueError(f"Type de stratégie inconnu: {strategy_type}")