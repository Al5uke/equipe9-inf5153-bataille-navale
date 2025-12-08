/**
 * Page de sélection du mode de jeu
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Bot, Target, ArrowLeft } from 'lucide-react';
import { GAME_MODES } from '../utils/constants';
import { createPlayer, createGame, joinMatchmaking } from '../utils/api';
import ContinueGameModal from '../components/ContinueGameModal';

const GameMode = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [waitingForMatch, setWaitingForMatch] = useState(false);
  const [showContinueModal, setShowContinueModal] = useState(false);
  const [ongoingGameData, setOngoingGameData] = useState(null);

  // Vérifier s'il y a une partie en cours contre IA
  useEffect(() => {
    const ongoingGame = localStorage.getItem('ongoing_ai_game');
    if (ongoingGame) {
      try {
        const gameData = JSON.parse(ongoingGame);
        // Vérifier que la partie n'est pas terminée
        if (gameData.gameId && gameData.status !== 'FINISHED') {
          setOngoingGameData(gameData);
          setShowContinueModal(true);
        } else {
          // Nettoyer si la partie est terminée
          localStorage.removeItem('ongoing_ai_game');
        }
      } catch (err) {
        console.error('Erreur parsing ongoing_ai_game:', err);
        localStorage.removeItem('ongoing_ai_game');
      }
    }
  }, []);

  const handleModeSelect = async (mode) => {
    setLoading(true);
    setError('');

    try {
      console.log('[GameMode] Mode sélectionné:', mode);

      // Récupérer ou créer le joueur
      let player = localStorage.getItem('battleship_player');

      if (!player) {
        console.log('[GameMode] Création d\'un nouveau joueur');
        const playerName = localStorage.getItem('battleship_player_name') || `Joueur${Date.now()}`;
        const newPlayer = await createPlayer(playerName);
        console.log('[GameMode] Joueur créé:', newPlayer);
        localStorage.setItem('battleship_player', JSON.stringify(newPlayer));
        player = JSON.stringify(newPlayer);
      }

      const playerData = JSON.parse(player);
      console.log('[GameMode] Données joueur:', playerData);

      // Si mode contre humain, aller au matchmaking
      if (mode === GAME_MODES.HUMAN_VS_HUMAN.value) {
        setWaitingForMatch(true);

        // Rejoindre la file d'attente
        const matchResult = await joinMatchmaking(playerData.id, playerData.name);

        if (matchResult.matched) {
          // Match trouvé immédiatement
          localStorage.setItem('current_game_id', matchResult.game_id);
          localStorage.setItem('opponent_name', matchResult.opponent_name);
          navigate('/place-ships');
        } else {
          // En attente, rediriger vers page de matchmaking
          navigate('/matchmaking');
        }
      } else {
        // Mode contre IA
        // Nettoyer toute partie en cours précédente
        localStorage.removeItem('ongoing_ai_game');

        console.log('[GameMode] Création partie contre IA, mode:', mode, 'player:', playerData.id);
        const game = await createGame(mode, playerData.id);
        console.log('[GameMode] Partie créée:', game);
        localStorage.setItem('current_game_id', game.game_id);
        localStorage.setItem('game_mode', mode);
        navigate('/place-ships');
      }
    } catch (err) {
      console.error('[GameMode] Erreur complète:', err);
      console.error('[GameMode] Response:', err.response);
      console.error('[GameMode] Data:', err.response?.data);
      const errorMsg = err.response?.data?.error || err.message || 'Une erreur est survenue';
      setError(errorMsg);
      setLoading(false);
      setWaitingForMatch(false);
    }
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case GAME_MODES.HUMAN_VS_HUMAN.value:
        return <Users className="w-16 h-16" />;
      case GAME_MODES.HUMAN_VS_AI_RANDOM.value:
        return <Bot className="w-16 h-16" />;
      case GAME_MODES.HUMAN_VS_AI_TARGETED.value:
        return <Target className="w-16 h-16" />;
      default:
        return null;
    }
  };

  const getModeColor = (mode) => {
    switch (mode) {
      case GAME_MODES.HUMAN_VS_HUMAN.value:
        return 'from-purple-600 to-purple-800';
      case GAME_MODES.HUMAN_VS_AI_RANDOM.value:
        return 'from-green-600 to-green-800';
      case GAME_MODES.HUMAN_VS_AI_TARGETED.value:
        return 'from-red-600 to-red-800';
      default:
        return 'from-blue-600 to-blue-800';
    }
  };

  if (waitingForMatch) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Recherche d'un adversaire...</h2>
          <p className="text-gray-600">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Image de fond identique à la page d'accueil */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1758291293507-777a405ad492?w=1920&q=80)',
          filter: 'brightness(0.6)'
        }}
      />

      {/* Overlay sombre pour contraste */}
      <div className="absolute inset-0 bg-black opacity-50" />

      {/* Grille verte en overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(34, 197, 94, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.4) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="max-w-6xl w-full relative z-10">
        {/* Bouton retour */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center space-x-2 text-white hover:text-green-400 transition-colors"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>

        {/* Titre */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4" style={{color: '#22c55e'}}>
            Choisir le mode de jeu
          </h1>
          <p className="text-xl text-gray-300">
            Sélectionnez votre adversaire
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Cartes des modes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.values(GAME_MODES).map((mode) => (
            <button
              key={mode.value}
              onClick={() => handleModeSelect(mode.value)}
              disabled={loading}
              data-testid={`mode-${mode.value}`}
              className={`
                bg-black bg-opacity-80 border-4
                text-white p-8 rounded-xl shadow-2xl
                transform hover:scale-105 transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
                flex flex-col items-center space-y-4
                group hover:bg-opacity-90
              `}
              style={{
                borderColor: '#22c55e'
              }}
            >
              <div className="p-4 rounded-full group-hover:bg-green-900 group-hover:bg-opacity-30 transition-all" style={{backgroundColor: 'rgba(34, 197, 94, 0.2)'}}>
                {getModeIcon(mode.value)}
              </div>
              <h2 className="text-2xl font-bold text-center" style={{color: '#22c55e'}}>{mode.label}</h2>
              <p className="text-center text-gray-300">{mode.description}</p>
              <div className="text-4xl">{mode.icon}</div>
            </button>
          ))}
        </div>

        {/* Info */}
        <div className="mt-12 bg-black bg-opacity-70 p-6 rounded-lg border-2" style={{borderColor: '#22c55e'}}>
          <h3 className="font-bold text-lg mb-3" style={{color: '#22c55e'}}>🎯 Modes de jeu:</h3>
          <ul className="text-gray-300 space-y-2 text-sm">
            <li>• <strong style={{color: '#22c55e'}}>Humain:</strong> Affrontez un joueur en ligne (matchmaking automatique)</li>
            <li>• <strong style={{color: '#22c55e'}}>IA Débutant:</strong> IA avec stratégie aléatoire (idéal pour apprendre)</li>
            <li>• <strong style={{color: '#22c55e'}}>IA Avancé:</strong> IA avec stratégie ciblée (challenge!)</li>
          </ul>
        </div>
      </div>

      {/* Modal de reprise de partie */}
      {showContinueModal && ongoingGameData && (
        <ContinueGameModal
          gameData={ongoingGameData}
          onClose={() => setShowContinueModal(false)}
        />
      )}
    </div>
  );
};

export default GameMode;
