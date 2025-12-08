/**
 * Page d'accueil avec image de fond navires dans la mer
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Anchor, Trophy, Eye } from 'lucide-react';
import ContinueGameModal from '../components/ContinueGameModal';

const Home = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [showAccountChoice, setShowAccountChoice] = useState(false);
  const [existingPlayerName, setExistingPlayerName] = useState('');
  const [error, setError] = useState('');
  const [showContinueModal, setShowContinueModal] = useState(false);
  const [ongoingGameData, setOngoingGameData] = useState(null);

  useEffect(() => {
    // PRIORITÉ 1 : Vérifier partie en cours contre IA
    const ongoingGame = localStorage.getItem('ongoing_ai_game');
    if (ongoingGame) {
      try {
        const gameData = JSON.parse(ongoingGame);
        if (gameData.gameId && gameData.status !== 'FINISHED') {
          setOngoingGameData(gameData);
          setShowContinueModal(true);
        } else {
          localStorage.removeItem('ongoing_ai_game');
        }
      } catch (err) {
        console.error('Erreur parsing ongoing_ai_game:', err);
        localStorage.removeItem('ongoing_ai_game');
      }
    }

    // PRIORITÉ 2 : Vérifier si un joueur existe déjà
    const existingPlayer = localStorage.getItem('battleship_player');
    const sessionConfirmed = sessionStorage.getItem('player_confirmed');

    if (existingPlayer && !sessionConfirmed) {
      // Joueur existe mais pas encore confirmé dans cette session (nouveau démarrage)
      const player = JSON.parse(existingPlayer);
      setExistingPlayerName(player.name);
      setShowAccountChoice(true);
      setShowNameInput(false);
    } else if (existingPlayer && sessionConfirmed) {
      // Joueur existe et déjà confirmé dans cette session (navigation)
      const player = JSON.parse(existingPlayer);
      setPlayerName(player.name);
      setShowNameInput(false);
      setShowAccountChoice(false);
    } else {
      // Pas de joueur existant
      setShowNameInput(true);
      setShowAccountChoice(false);
    }

    // Nettoyer l'ID de partie précédent (sauf si partie en cours)
    if (!ongoingGame) {
      localStorage.removeItem('current_game_id');
    }
  }, []);

  const handlePlayGame = () => {
    if (playerName) {
      navigate('/game-mode');
    } else {
      setShowNameInput(true);
    }
  };

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (playerName.trim().length < 2) {
      setError('Le nom doit contenir au moins 2 caractères');
      return;
    }

    // Créer le compte du joueur
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la création du compte');
        return;
      }

      const player = await response.json();
      localStorage.setItem('battleship_player', JSON.stringify(player));
      localStorage.setItem('battleship_player_name', playerName);
      sessionStorage.setItem('player_confirmed', 'true');

      // Fermer le formulaire et afficher le message de bienvenue
      setShowNameInput(false);
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error(err);
    }
  };

  const handleWatchGame = () => {
    navigate('/spectator');
  };

  const handleLeaderboard = () => {
    navigate('/leaderboard');
  };

  const handleContinueWithExisting = () => {
    const player = JSON.parse(localStorage.getItem('battleship_player'));
    setPlayerName(player.name);
    setShowAccountChoice(false);
    setShowNameInput(false);
    sessionStorage.setItem('player_confirmed', 'true');
  };

  const handleCreateNewAccount = () => {
    setShowAccountChoice(false);
    setShowNameInput(true);
    setPlayerName('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Image de fond - Vraie photo de navires de guerre sur la mer */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1758291293507-777a405ad492?w=1920&q=80)',
          filter: 'brightness(0.7)'
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

      <div className="max-w-4xl w-full relative z-10">
        {/* Icône navire en haut */}
        <div className="text-center mb-8 animate-fade-in">
          <svg width="120" height="60" viewBox="0 0 120 60" className="mx-auto mb-4">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <g filter="url(#glow)">
              <rect x="20" y="25" width="80" height="15" fill="#22c55e" opacity="0.9"/>
              <rect x="25" y="22" width="70" height="8" fill="#10b981"/>
              <rect x="70" y="18" width="15" height="12" fill="#059669"/>
            </g>
          </svg>

          <h1 className="text-6xl md:text-8xl font-bold mb-4 animate-bounce-slow"
              style={{
                color: '#22c55e',
                textShadow: '0 0 20px rgba(34, 197, 94, 0.8), 0 0 40px rgba(34, 197, 94, 0.5)',
                letterSpacing: '0.1em'
              }}>
            BATAILLE NAVALE
          </h1>
          <p className="text-xl text-green-400 animate-pulse font-semibold">
            Coulez tous les navires de votre adversaire!
          </p>
        </div>

        {/* Choix du compte au redémarrage */}
        {showAccountChoice ? (
          <div className="space-y-6 animate-slide-up">
            <div className="bg-black bg-opacity-80 border-4 p-8 rounded-xl shadow-2xl" style={{borderColor: '#22c55e'}}>
              <h2 className="text-2xl font-bold mb-6 text-center" style={{color: '#22c55e'}}>
                Bon retour, marin !
              </h2>
              <p className="text-gray-300 text-center mb-8">
                Voulez-vous continuer avec votre compte existant ?
              </p>

              {/* Bouton continuer avec le compte existant */}
              <button
                onClick={handleContinueWithExisting}
                className="w-full text-white font-bold py-4 px-6 rounded-lg mb-4 transform hover:scale-105 transition-all shadow-lg"
                style={{backgroundColor: '#22c55e'}}
              >
                <span className="text-xl">Continuer en tant que &ldquo;{existingPlayerName}&rdquo;</span>
              </button>

              {/* Bouton créer un nouveau compte */}
              <button
                onClick={handleCreateNewAccount}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transform hover:scale-105 transition-all shadow-lg"
              >
                <span className="text-xl">Créer un nouveau compte</span>
              </button>
            </div>
          </div>
        ) : !showNameInput ? (
          <div className="space-y-6 animate-slide-up">
            {/* Bienvenue message */}
            <div className="bg-black bg-opacity-80 border-2 p-4 rounded-lg text-center mb-4" style={{borderColor: '#22c55e'}}>
              <p className="text-green-400 text-xl mb-2">
                Bienvenue, <span className="font-bold" style={{color: '#22c55e'}}>{playerName}</span> ! 👋
              </p>
            </div>

            <button
              data-testid="play-game-btn"
              onClick={handlePlayGame}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-6 px-8 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-4 group border-2 border-green-400"
              style={{
                boxShadow: '0 0 30px rgba(34, 197, 94, 0.6)'
              }}
            >
              <Anchor className="w-8 h-8 group-hover:rotate-12 transition-transform" />
              <span className="text-2xl">Jouer une partie</span>
            </button>

            <button
              data-testid="watch-game-btn"
              onClick={handleWatchGame}
              className="w-full bg-gray-900 hover:bg-gray-800 text-green-400 font-bold py-6 px-8 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-4 group border-2 border-green-500"
              style={{
                boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)'
              }}
            >
              <Eye className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <span className="text-2xl">Regarder une partie</span>
            </button>

            <button
              data-testid="leaderboard-btn"
              onClick={handleLeaderboard}
              className="w-full bg-gray-900 hover:bg-gray-800 text-green-400 font-bold py-6 px-8 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-4 group border-2 border-green-500"
              style={{
                boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)'
              }}
            >
              <Trophy className="w-8 h-8 group-hover:rotate-12 transition-transform" />
              <span className="text-2xl">Classement</span>
            </button>
          </div>
        ) : (
          <div className="bg-gray-900 p-8 rounded-xl shadow-2xl animate-slide-up border-2 border-green-500"
               style={{
                 boxShadow: '0 0 40px rgba(34, 197, 94, 0.5)'
               }}>
            <h2 className="text-2xl font-bold text-green-400 mb-6 text-center">
              Quel est votre nom, marin?
            </h2>
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <input
                type="text"
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value);
                  setError('');
                }}
                placeholder="Entrez votre nom"
                className="w-full px-4 py-3 border-2 border-green-500 bg-black text-green-400 rounded-lg focus:border-green-400 focus:outline-none text-lg placeholder-gray-600"
                autoFocus
                data-testid="player-name-input"
              />
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition-colors border-2 border-green-400"
                  data-testid="submit-name-btn"
                >
                  Continuer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNameInput(false);
                    setError('');
                  }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-green-400 font-bold py-3 rounded-lg transition-colors border-2 border-green-500"
                >
                  Retour
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-12 text-center text-green-400 opacity-70">
          <p className="text-sm">
            Projet INF5153 - Bataille Navale © 2025
          </p>
        </div>
      </div>

      {/* Modal de reprise de partie - Affichage prioritaire */}
      {showContinueModal && ongoingGameData && (
        <ContinueGameModal
          gameData={ongoingGameData}
          onClose={() => setShowContinueModal(false)}
        />
      )}
    </div>
  );
};

export default Home;
