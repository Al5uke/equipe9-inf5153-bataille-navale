"""Modèles de données pour la bataille navale"""
from dataclasses import dataclass, field
from typing import List, Optional, Dict
from datetime import datetime
import json

@dataclass
class Player:
    """Modèle Joueur"""
    id: str
    name: str
    email: Optional[str] = None
    victories: int = 0
    defeats: int = 0
    total_shots: int = 0
    successful_shots: int = 0
    accuracy: float = 0.0
    created_at: Optional[str] = None
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'victories': self.victories,
            'defeats': self.defeats,
            'total_shots': self.total_shots,
            'successful_shots': self.successful_shots,
            'accuracy': self.accuracy,
            'created_at': self.created_at
        }

@dataclass
class Ship:
    """Modèle Navire"""
    id: str
    grid_id: str
    ship_type: str  # PORTE_AVION, CROISEUR, SOUS_MARIN, CONTRE_TORPILLEUR, TORPILLEUR
    size: int
    positions: List[str]  # Ex: ['A1', 'A2', 'A3']
    orientation: str  # HORIZONTAL ou VERTICAL
    hits: int = 0
    is_sunk: bool = False
    
    def to_dict(self):
        return {
            'id': self.id,
            'grid_id': self.grid_id,
            'ship_type': self.ship_type,
            'size': self.size,
            'positions': self.positions,
            'orientation': self.orientation,
            'hits': self.hits,
            'is_sunk': self.is_sunk
        }

@dataclass
class Grid:
    """Modèle Grille 10x10"""
    id: str
    game_id: str
    player_id: str
    grid_data: Dict[str, str]  # {'A1': 'EMPTY', 'B2': 'SHIP', 'C3': 'HIT', 'D4': 'MISS'}
    ships_placed: bool = False
    
    def to_dict(self):
        return {
            'id': self.id,
            'game_id': self.game_id,
            'player_id': self.player_id,
            'grid_data': self.grid_data,
            'ships_placed': self.ships_placed
        }

@dataclass
class Game:
    """Modèle Partie"""
    id: str
    mode: str  # HUMAN_VS_HUMAN, HUMAN_VS_AI_RANDOM, HUMAN_VS_AI_TARGETED
    player1_id: str
    player2_id: Optional[str] = None
    current_turn: Optional[str] = None
    status: str = 'WAITING'  # WAITING, PLACING_SHIPS, IN_PROGRESS, FINISHED
    winner_id: Optional[str] = None
    created_at: Optional[str] = None
    finished_at: Optional[str] = None
    
    def to_dict(self):
        return {
            'id': self.id,
            'mode': self.mode,
            'player1_id': self.player1_id,
            'player2_id': self.player2_id,
            'current_turn': self.current_turn,
            'status': self.status,
            'winner_id': self.winner_id,
            'created_at': self.created_at,
            'finished_at': self.finished_at
        }

@dataclass
class Move:
    """Modèle Coup joué"""
    id: str
    game_id: str
    player_id: str
    target_position: str  # Ex: 'A5'
    result: str  # MISS, HIT, SUNK
    ship_sunk_type: Optional[str] = None
    move_number: int = 0
    created_at: Optional[str] = None
    
    def to_dict(self):
        return {
            'id': self.id,
            'game_id': self.game_id,
            'player_id': self.player_id,
            'target_position': self.target_position,
            'result': self.result,
            'ship_sunk_type': self.ship_sunk_type,
            'move_number': self.move_number,
            'created_at': self.created_at
        }

@dataclass
class LeaderboardEntry:
    """Modèle Entrée du classement"""
    id: str
    player_id: str
    rank: Optional[int] = None
    score: int = 0
    updated_at: Optional[str] = None
    player_name: Optional[str] = None  # Jointure avec table players
    
    def to_dict(self):
        return {
            'id': self.id,
            'player_id': self.player_id,
            'rank': self.rank,
            'score': self.score,
            'updated_at': self.updated_at,
            'player_name': self.player_name
        }

# Constantes pour les types de navires
SHIP_TYPES = {
    'PORTE_AVION': 5,
    'CROISEUR': 4,
    'SOUS_MARIN': 3,
    'CONTRE_TORPILLEUR': 3,
    'TORPILLEUR': 2
}

# États des cases de la grille
CELL_STATES = {
    'EMPTY': 'EMPTY',      # Case vide
    'SHIP': 'SHIP',        # Case avec un navire
    'HIT': 'HIT',          # Navire touché
    'MISS': 'MISS'         # Tir dans l'eau
}

# Modes de jeu
GAME_MODES = {
    'HUMAN_VS_HUMAN': 'HUMAN_VS_HUMAN',
    'HUMAN_VS_AI_RANDOM': 'HUMAN_VS_AI_RANDOM',
    'HUMAN_VS_AI_TARGETED': 'HUMAN_VS_AI_TARGETED'
}

# États des parties
GAME_STATUS = {
    'WAITING': 'WAITING',              # En attente d'un adversaire
    'PLACING_SHIPS': 'PLACING_SHIPS',  # Placement des navires
    'IN_PROGRESS': 'IN_PROGRESS',      # Partie en cours
    'FINISHED': 'FINISHED'             # Partie terminée
}