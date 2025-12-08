/**
 * Page principale du jeu - Plateau avec 2 grilles
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trophy, Home, Volume2, VolumeX } from 'lucide-react';
import Grid from '../components/Grid';
import { getGame, getGameGrids, playTurn, aiTurn, getPlayerShips } from '../utils/api';
import soundManager from '../utils/sounds';
import { GAME_STATUS } from '../utils/constants';

const Game = () => {
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [myGrid, setMyGrid] = useState({});
  const [opponentGrid, setOpponentGrid] = useState({});
  const [myShips, setMyShips] = useState([]);
  const [opponentShips, setOpponentShips] = useState([]);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shooting, setShooting] = useState(false);
  const [message, setMessage] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastShot, setLastShot] = useState(null);

  const { gameId: routeGameId } = useParams();
  const player = JSON.parse(localStorage.getItem('battleship_player') || '{}');
  const gameId = routeGameId || localStorage.getItem('current_game_id');
  const gameMode = localStorage.getItem('game_mode');

  // Sauvegarder l'état de la partie en cours (pour reprise)
  useEffect(() => {
    if (gameId && gameMode && (gameMode.includes('AI') || gameMode.includes('IA'))) {
      const ongoingGame = {
        gameId,
        mode: gameMode,
        playerId: player.id,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('ongoing_ai_game', JSON.stringify(ongoingGame));
    }
  }, [gameId, gameMode, player.id]);

  // Avertir l'utilisateur avant de quitter une partie en cours contre IA
  useEffect(() => {
    if (!gameId || !gameMode || gameOver) return;

    // Seulement pour les parties contre IA
    if (gameMode.includes('AI') || gameMode.includes('IA')) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = ''; // Chrome nécessite returnValue vide
        return 'Vous avez une partie en cours. Si vous quittez, vous pourrez la reprendre plus tard.';
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [gameId, gameMode, gameOver]);

  // Charger les données du jeu
  const loadGameData = useCallback(async () => {
    try {
      // Récupérer la partie
      const gameData = await getGame(gameId);
      setGame(gameData);

      // Sauvegarder le statut pour le modal de reprise
      if (gameMode && (gameMode.includes('AI') || gameMode.includes('IA'))) {
        const ongoingGame = JSON.parse(localStorage.getItem('ongoing_ai_game') || '{}');
        if (ongoingGame.gameId === gameId) {
          ongoingGame.status = gameData.status;
          localStorage.setItem('ongoing_ai_game', JSON.stringify(ongoingGame));
        }
      }

      // Vérifier si c'est le tour du joueur
      setIsMyTurn(gameData.current_turn === player.id);

      // Récupérer les grilles
      const gridsData = await getGameGrids(gameId);
      setMyGrid(gridsData[player.id]?.grid_data || {});

      // Pour la grille adversaire, masquer les navires non touchés
      const opponentId = gameData.player1_id === player.id
        ? gameData.player2_id
        : gameData.player1_id;

      if (gridsData[opponentId]) {
        const hiddenOpponentGrid = {};
        Object.keys(gridsData[opponentId].grid_data).forEach(pos => {
          const state = gridsData[opponentId].grid_data[pos];
          // Cacher les navires non touchés
          hiddenOpponentGrid[pos] = (state === 'SHIP') ? 'EMPTY' : state;
        });
        setOpponentGrid(hiddenOpponentGrid);
      }

      // Récupérer les navires
      const myShipsData = await getPlayerShips(gameId, player.id);
      setMyShips(myShipsData);

      // Récupérer les navires adverses (uniquement ceux coulés seront affichés)
      try {
        const opponentShipsData = await getPlayerShips(gameId, opponentId);
        // Ne garder que les navires coulés pour l'affichage
        const sunkShips = opponentShipsData.filter(ship => ship.is_sunk);
        setOpponentShips(sunkShips);
      } catch (err) {
        console.error('Erreur récupération navires adverses:', err);
        setOpponentShips([]);
      }

      // Vérifier si la partie est terminée
      if (gameData.status === GAME_STATUS.FINISHED) {
        setGameOver(true);
        setWinner(gameData.winner_id);

        // Nettoyer la sauvegarde de partie en cours
        localStorage.removeItem('ongoing_ai_game');

        if (gameData.winner_id === player.id) {
          setMessage('Victoire! Vous avez coulé tous les navires ennemis!');
          if (soundEnabled) soundManager.playWin();
        } else {
          setMessage('Défaite... Tous vos navires ont été coulés.');
          if (soundEnabled) soundManager.playLose();
        }
      } else if (gameData.status === GAME_STATUS.IN_PROGRESS) {
        if (isMyTurn) {
          setMessage('À votre tour! Cliquez sur la grille adverse pour tirer.');
        } else {
          setMessage('Tour de l\'adversaire...');
        }
      } else if (gameData.status === GAME_STATUS.PLACING_SHIPS) {
        setMessage('En attente que l\'adversaire place ses navires...');
      }

      setLoading(false);
    } catch (err) {
      console.error('Erreur chargement partie:', err);
      setMessage('Erreur lors du chargement de la partie');
      setLoading(false);
    }
  }, [gameId, player.id, isMyTurn, soundEnabled]);

  // Charger au démarrage
  useEffect(() => {
    if (gameId) {
      loadGameData();
    } else {
      navigate('/');
    }
  }, [gameId, navigate, loadGameData]);

  // Polling pour les updates (mode contre humain ou tour de l'IA)
  useEffect(() => {
    if (gameOver || loading) return;

    const interval = setInterval(() => {
      loadGameData();
    }, 2000); // Vérifier toutes les 2 secondes

    return () => clearInterval(interval);
  }, [gameOver, loading, loadGameData]);

  // Jouer automatiquement le tour de l'IA
  useEffect(() => {
    const playAITurn = async () => {
      if (!game || gameOver || loading) return;
      if (isMyTurn) return; // C'est le tour du joueur

      // Vérifier si c'est le tour de l'IA
      const opponentId = game.player1_id === player.id
        ? game.player2_id
        : game.player1_id;

      if (opponentId.startsWith('ai_') && game.current_turn === opponentId) {
        // Attendre un peu pour simuler la réflexion
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
          const result = await aiTurn(gameId, opponentId);

          // Afficher le résultat
          setLastShot({ position: result.ai_target, result: result.result });

          if (result.result === 'HIT') {
            setMessage(`L'IA a touché votre navire en ${result.ai_target}!`);
            if (soundEnabled) soundManager.playHit();
          } else if (result.result === 'SUNK') {
            setMessage(`L'IA a coulé votre ${result.ship_sunk_type} en ${result.ai_target}!`);
            if (soundEnabled) soundManager.playSunk();
          } else {
            setMessage(`L'IA a raté en ${result.ai_target}.`);
            if (soundEnabled) soundManager.playMiss();
          }

          // Recharger les données
          setTimeout(() => {
            loadGameData();
          }, 1500);
        } catch (err) {
          console.error('Erreur tour IA:', err);
        }
      }
    };

    playAITurn();
  }, [game, gameOver, loading, isMyTurn, player.id, gameId, soundEnabled, loadGameData]);

  // Tirer sur une case
  const handleShoot = async (position) => {
    if (!isMyTurn || shooting || gameOver) return;

    // Vérifier si la case a déjà été tirée
    if (opponentGrid[position] === 'HIT' || opponentGrid[position] === 'MISS') {
      setMessage('Vous avez déjà tiré sur cette case!');
      return;
    }

    setShooting(true);
    setMessage('Tir en cours...');

    if (soundEnabled) soundManager.playShoot();

    try {
      const result = await playTurn(gameId, player.id, position);

      setLastShot({ position, result: result.result });

      // Afficher le résultat
      if (result.result === 'HIT') {
        setMessage(`Touché en ${position}!`);
        if (soundEnabled) soundManager.playHit();
      } else if (result.result === 'SUNK') {
        setMessage(`Coulé! Vous avez détruit le ${result.ship_sunk_type} en ${position}!`);
        if (soundEnabled) soundManager.playSunk();
      } else {
        setMessage(`À l'eau en ${position}.`);
        if (soundEnabled) soundManager.playMiss();
      }

      // Recharger les données
      setTimeout(() => {
        loadGameData();
        setShooting(false);
      }, 1500);
    } catch (err) {
      console.error('Erreur tir:', err);
      setMessage('Erreur lors du tir');
      setShooting(false);
    }
  };

  const toggleSound = () => {
    const newState = soundManager.toggle();
    setSoundEnabled(newState);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Image de fond */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1758291293507-777a405ad492?w=1920&q=80)',
            filter: 'brightness(0.6)'
          }}
        />
        <div className="absolute inset-0 bg-black opacity-50" />

        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto mb-4" style={{borderColor: '#22c55e'}}></div>
          <p className="text-xl" style={{color: '#22c55e'}}>Chargement de la partie...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 relative overflow-hidden">
      {/* Image de fond */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1758291293507-777a405ad492?w=1920&q=80)',
          filter: 'brightness(0.6)'
        }}
      />
      <div className="absolute inset-0 bg-black opacity-50" />

      {/* Grille verte */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(34, 197, 94, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.4) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="bg-black bg-opacity-80 border-2 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors hover:bg-opacity-90"
              style={{borderColor: '#22c55e'}}
              data-testid="home-btn"
            >
              <Home className="w-5 h-5" />
              <span>Accueil</span>
            </button>
            <button
              onClick={toggleSound}
              className="bg-black bg-opacity-80 border-2 text-white px-4 py-2 rounded-lg transition-colors hover:bg-opacity-90"
              style={{borderColor: '#22c55e'}}
              data-testid="sound-toggle-btn"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold" style={{color: '#22c55e'}}>{game?.player1_name} vs {game?.player2_name}</h2>
            <p className="text-gray-300 text-sm">Mode: {gameMode?.includes('HUMAN') ? 'PvP' : 'vs IA'}</p>
          </div>

          <div className="w-32"></div>
        </div>

        {/* Message */}
        <div className={`
          mb-6 p-4 rounded-lg text-center text-xl font-bold border-2
          ${gameOver
            ? (winner === player.id ? 'bg-green-900 bg-opacity-80 border-green-500' : 'bg-red-900 bg-opacity-80 border-red-500')
            : (isMyTurn ? 'bg-black bg-opacity-80 border-green-500' : 'bg-yellow-900 bg-opacity-80 border-yellow-500')
          }
          text-white animate-pulse
        `} data-testid="game-message">
          {message}
        </div>

        {/* Grilles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Votre grille */}
          <div className="bg-black bg-opacity-80 border-4 p-6 rounded-xl shadow-2xl" style={{borderColor: '#22c55e'}}>
            <Grid
              gridData={myGrid}
              isOwn={true}
              title={`Votre grille - ${player.name}`}
              ships={myShips}
            />
            <div className="mt-4">
              <h4 className="font-bold mb-2" style={{color: '#22c55e'}}>Vos navires:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {myShips.map((ship, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded border-2 ${ship.is_sunk ? 'bg-red-900 bg-opacity-50 border-red-500 text-red-200' : 'bg-green-900 bg-opacity-50 border-green-500 text-green-200'}`}
                  >
                    <span className="font-semibold">{ship.ship_type}</span>
                    <span className="ml-2 text-xs">({ship.hits}/{ship.size})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grille adversaire */}
          <div className="bg-black bg-opacity-80 border-4 p-6 rounded-xl shadow-2xl" style={{borderColor: '#22c55e'}}>
            <Grid
              gridData={opponentGrid}
              isOwn={true}
              title="Grille adverse"
              onCellClick={isMyTurn && !gameOver ? handleShoot : null}
              highlightedCells={lastShot ? [lastShot.position] : []}
              ships={opponentShips}
            />
            <div className="mt-4">
              <h4 className="font-bold mb-2" style={{color: '#22c55e'}}>Navires ennemis coulés:</h4>
              {opponentShips.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {opponentShips.map((ship, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-red-900 bg-opacity-50 border-2 border-red-500 text-red-200"
                    >
                      <span className="font-semibold">{ship.ship_type}</span>
                      <span className="ml-2 text-xs">✓ Coulé</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Aucun navire coulé pour le moment</p>
              )}
              {lastShot && (
                <div className="mt-3 p-2 bg-black bg-opacity-60 border-2 rounded text-center" style={{borderColor: '#22c55e'}}>
                  <p className="text-sm text-gray-300">
                    Dernier tir: <span className="font-bold" style={{color: '#22c55e'}}>{lastShot.position}</span> -
                    <span className={`ml-2 font-bold ${
                      lastShot.result === 'HIT' || lastShot.result === 'SUNK'
                        ? 'text-red-400'
                        : 'text-blue-400'
                    }`}>
                      {lastShot.result === 'HIT' ? 'TOUCHÉ' :
                       lastShot.result === 'SUNK' ? 'COULÉ' :
                       'RATÉ'}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Boutons fin de partie */}
        {gameOver && (
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="bg-black bg-opacity-80 border-2 text-white font-bold px-8 py-4 rounded-lg transition-colors hover:bg-opacity-90"
              style={{borderColor: '#22c55e'}}
            >
              Retour à l'accueil
            </button>
            <button
              onClick={() => navigate('/game-mode')}
              className="bg-opacity-80 border-2 text-white font-bold px-8 py-4 rounded-lg transition-colors hover:bg-opacity-90"
              style={{backgroundColor: '#22c55e', borderColor: '#16a34a'}}
            >
              Nouvelle partie
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="bg-yellow-900 bg-opacity-80 border-2 border-yellow-500 text-white font-bold px-8 py-4 rounded-lg flex items-center space-x-2 transition-colors hover:bg-opacity-90"
            >
              <Trophy className="w-5 h-5" />
              <span>Classement</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;
