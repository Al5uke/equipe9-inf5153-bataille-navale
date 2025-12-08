/**
 * API client pour communiquer avec le backend Flask
 */
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Configuration axios
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ============= JOUEURS =============

export const createPlayer = async (name, email = null) => {
  try {
    const response = await api.post('/players', { name, email });
    return response.data;
  } catch (error) {
    console.error('Erreur création joueur:', error);
    throw error;
  }
};

export const getPlayer = async (playerId) => {
  try {
    const response = await api.get(`/players/${playerId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur récupération joueur:', error);
    throw error;
  }
};

export const getPlayerStats = async (playerId) => {
  try {
    const response = await api.get(`/players/${playerId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Erreur récupération stats:', error);
    throw error;
  }
};

// ============= MATCHMAKING =============

export const joinMatchmaking = async (playerId, playerName) => {
  try {
    const response = await api.post('/matchmaking/join', {
      player_id: playerId,
      player_name: playerName
    });
    return response.data;
  } catch (error) {
    console.error('Erreur matchmaking:', error);
    throw error;
  }
};

export const checkMatchmaking = async (playerId) => {
  try {
    const response = await api.get(`/matchmaking/check/${playerId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur vérification match:', error);
    throw error;
  }
};

export const leaveMatchmaking = async (playerId) => {
  try {
    const response = await api.post('/matchmaking/leave', {
      player_id: playerId
    });
    return response.data;
  } catch (error) {
    console.error('Erreur sortie matchmaking:', error);
    throw error;
  }
};

// ============= PARTIES =============

export const createGame = async (mode, playerId) => {
  try {
    const response = await api.post('/games', {
      mode,
      player1_id: playerId
    });
    return response.data;
  } catch (error) {
    console.error('Erreur création partie:', error);
    throw error;
  }
};

export const getGame = async (gameId) => {
  try {
    const response = await api.get(`/games/${gameId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur récupération partie:', error);
    throw error;
  }
};

export const getGameGrids = async (gameId) => {
  try {
    const response = await api.get(`/games/${gameId}/grids`);
    return response.data;
  } catch (error) {
    console.error('Erreur récupération grilles:', error);
    throw error;
  }
};

export const getPlayerShips = async (gameId, playerId) => {
  try {
    const response = await api.get(`/games/${gameId}/ships/${playerId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur récupération navires:', error);
    throw error;
  }
};

export const placeShips = async (gameId, playerId, ships) => {
  try {
    const response = await api.post(`/games/${gameId}/place-ships`, {
      player_id: playerId,
      ships
    });
    return response.data;
  } catch (error) {
    console.error('Erreur placement navires:', error);
    throw error;
  }
};

export const placeShipsRandom = async (gameId, playerId) => {
  try {
    const response = await api.post(`/games/${gameId}/place-ships-random`, {
      player_id: playerId
    });
    return response.data;
  } catch (error) {
    console.error('Erreur placement aléatoire:', error);
    throw error;
  }
};

export const playTurn = async (gameId, playerId, targetPosition) => {
  try {
    const response = await api.post(`/games/${gameId}/play`, {
      player_id: playerId,
      target_position: targetPosition
    });
    return response.data;
  } catch (error) {
    console.error('Erreur jeu tour:', error);
    throw error;
  }
};

export const aiTurn = async (gameId, aiPlayerId) => {
  try {
    const response = await api.post(`/games/${gameId}/ai-turn`, {
      ai_player_id: aiPlayerId
    });
    return response.data;
  } catch (error) {
    console.error('Erreur tour IA:', error);
    throw error;
  }
};

export const getGameMoves = async (gameId) => {
  try {
    const response = await api.get(`/games/${gameId}/moves`);
    return response.data;
  } catch (error) {
    console.error('Erreur récupération coups:', error);
    throw error;
  }
};

// ============= CLASSEMENT =============

export const getLeaderboard = async () => {
  try {
    const response = await api.get('/leaderboard');
    return response.data;
  } catch (error) {
    console.error('Erreur récupération classement:', error);
    throw error;
  }
};

// ============= MODE SPECTATEUR =============

export const getSpectatableGames = async () => {
  try {
    const response = await api.get('/spectator/games');
    return response.data;
  } catch (error) {
    console.error('Erreur récupération parties spectateur:', error);
    throw error;
  }
};

export const getSpectatorView = async (gameId) => {
  try {
    const response = await api.get(`/spectator/games/${gameId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur vue spectateur:', error);
    throw error;
  }
};

export default api;
