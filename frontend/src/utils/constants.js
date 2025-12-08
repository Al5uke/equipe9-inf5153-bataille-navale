/**
 * Constantes du jeu de bataille navale
 */

// Types de navires avec leurs tailles et noms français
export const SHIP_TYPES = {
  PORTE_AVION: {
    type: 'PORTE_AVION',
    size: 5,
    name: 'Porte-avion',
    emoji: '🛳️'
  },
  CROISEUR: {
    type: 'CROISEUR',
    size: 4,
    name: 'Croiseur',
    emoji: '🚢'
  },
  SOUS_MARIN: {
    type: 'SOUS_MARIN',
    size: 3,
    name: 'Sous-marin',
    emoji: '🔱'
  },
  CONTRE_TORPILLEUR: {
    type: 'CONTRE_TORPILLEUR',
    size: 3,
    name: 'Contre-torpilleur',
    emoji: '⚓'
  },
  TORPILLEUR: {
    type: 'TORPILLEUR',
    size: 2,
    name: 'Torpilleur',
    emoji: '🚤'
  }
};

// Liste des navires pour le placement
export const SHIPS_TO_PLACE = [
  SHIP_TYPES.PORTE_AVION,
  SHIP_TYPES.CROISEUR,
  SHIP_TYPES.SOUS_MARIN,
  SHIP_TYPES.CONTRE_TORPILLEUR,
  SHIP_TYPES.TORPILLEUR
];

// Grille 10x10 (garder pour compatibilité backend)
export const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
export const COLS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

// États des cases
export const CELL_STATES = {
  EMPTY: 'EMPTY',
  SHIP: 'SHIP',
  HIT: 'HIT',
  MISS: 'MISS'
};

// Modes de jeu
export const GAME_MODES = {
  HUMAN_VS_HUMAN: {
    value: 'HUMAN_VS_HUMAN',
    label: 'Jouer contre un Humain',
    description: 'Affrontez un adversaire en ligne',
    icon: '👥'
  },
  HUMAN_VS_AI_RANDOM: {
    value: 'HUMAN_VS_AI_RANDOM',
    label: 'IA Niveau Débutant',
    description: 'IA avec stratégie aléatoire',
    icon: '🤖'
  },
  HUMAN_VS_AI_TARGETED: {
    value: 'HUMAN_VS_AI_TARGETED',
    label: 'IA Niveau Avancé',
    description: 'IA avec stratégie ciblée',
    icon: '🎯'
  }
};

// Orientations
export const ORIENTATIONS = {
  HORIZONTAL: 'HORIZONTAL',
  VERTICAL: 'VERTICAL'
};

// États de la partie
export const GAME_STATUS = {
  WAITING: 'WAITING',
  PLACING_SHIPS: 'PLACING_SHIPS',
  IN_PROGRESS: 'IN_PROGRESS',
  FINISHED: 'FINISHED'
};

// Résultats de tir
export const SHOT_RESULTS = {
  MISS: 'MISS',
  HIT: 'HIT',
  SUNK: 'SUNK'
};

// Couleur vert néon
export const NEON_GREEN = '#22c55e';
