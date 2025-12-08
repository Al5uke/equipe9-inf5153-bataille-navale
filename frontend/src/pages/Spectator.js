/**
 * Page mode spectateur
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, RefreshCw } from 'lucide-react';
import Grid from '../components/Grid';
import { getSpectatableGames, getSpectatorView } from '../utils/api';

const Spectator = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [player1Grid, setPlayer1Grid] = useState({});
  const [player2Grid, setPlayer2Grid] = useState({});
  const [player1Ships, setPlayer1Ships] = useState([]);
  const [player2Ships, setPlayer2Ships] = useState([]);
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (gameId) {
      loadGameView(gameId);
    } else {
      loadGames();
    }
  }, [gameId]);

  // Recharger automatiquement toutes les 3 secondes
  useEffect(() => {
    if (selectedGame) {
      const interval = setInterval(() => {
        loadGameView(selectedGame.id);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [selectedGame]);

  const loadGames = async () => {
    try {
      const data = await getSpectatableGames();
      setGames(data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur chargement parties:', err);
      setError('Erreur lors du chargement des parties');
      setLoading(false);
    }
  };

  const loadGameView = async (id) => {
    try {
      const data = await getSpectatorView(id);
      setSelectedGame(data.game);

      const grids = data.grids;
      setPlayer1Grid(grids[data.game.player1_id] || {});
      setPlayer2Grid(grids[data.game.player2_id] || {});
      setMoves(data.moves || []);

      // Charger les navires des deux joueurs
      const { getPlayerShips } = await import('../utils/api');
      const p1Ships = await getPlayerShips(id, data.game.player1_id);
      const p2Ships = await getPlayerShips(id, data.game.player2_id);
      setPlayer1Ships(p1Ships);
      setPlayer2Ships(p2Ships);

      setLoading(false);
    } catch (err) {
      console.error('Erreur chargement vue spectateur:', err);
      setError('Erreur lors du chargement de la partie');
      setLoading(false);
    }
  };

  const handleSelectGame = (game) => {
    navigate(`/spectator/${game.id}`);
  };

  const handleBack = () => {
    if (selectedGame) {
      navigate('/spectator');
      setSelectedGame(null);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
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
          <p className="text-xl" style={{color: '#22c55e'}}>Chargement...</p>
        </div>
      </div>
    );
  }

  // Vue liste des parties
  if (!selectedGame) {
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

        <div className="max-w-4xl mx-auto relative z-10">
          <button
            onClick={handleBack}
            className="mb-6 flex items-center space-x-2 text-white hover:text-green-400 transition-colors"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>

          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Eye className="w-16 h-16" style={{color: '#22c55e'}} />
              <h1 className="text-5xl font-bold" style={{color: '#22c55e'}}>Mode Spectateur</h1>
            </div>
            <p className="text-xl text-gray-300">
              Regardez les parties en cours
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-900 bg-opacity-80 border-2 border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-black bg-opacity-80 border-4 rounded-xl shadow-2xl p-6" style={{borderColor: '#22c55e'}}>
            {games.length === 0 ? (
              <div className="text-center py-12">
                <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 text-lg">Aucune partie en cours pour le moment</p>
                <p className="text-gray-400 text-sm mt-2">Revenez plus tard ou lancez une partie!</p>
                <button
                  onClick={() => navigate('/game-mode')}
                  className="mt-6 text-white font-bold px-6 py-3 rounded-lg transition-colors hover:bg-opacity-90"
                  style={{backgroundColor: '#22c55e'}}
                >
                  Jouer une partie
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold" style={{color: '#22c55e'}}>Parties en cours ({games.length})</h2>
                  <button
                    onClick={loadGames}
                    className="text-green-400 hover:text-green-300 flex items-center space-x-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Actualiser</span>
                  </button>
                </div>
                {games.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => handleSelectGame(game)}
                    className="w-full bg-green-900 bg-opacity-30 hover:bg-opacity-50 p-4 rounded-lg border-2 transition-all text-left"
                    style={{borderColor: '#22c55e'}}
                    data-testid={`game-${game.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-white text-lg">
                          {game.player1_name} vs {game.player2_name}
                        </h3>
                        <p className="text-sm text-gray-300">
                          Mode: {game.mode.includes('HUMAN') ? 'PvP' : 'vs IA'}
                        </p>
                      </div>
                      <div style={{color: '#22c55e'}}>
                        <Eye className="w-6 h-6" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Vue détaillée d'une partie
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
        <button
          onClick={handleBack}
          className="mb-6 flex items-center space-x-2 text-white hover:text-blue-200 transition-colors"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour à la liste</span>
        </button>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            {selectedGame.player1_name} vs {selectedGame.player2_name}
          </h1>
          <p className="text-blue-100">
            👁️ Mode Spectateur - Mise à jour automatique toutes les 3s
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-2xl">
            <Grid
              gridData={player1Grid}
              isOwn={true}
              title={selectedGame.player1_name}
              ships={player1Ships}
            />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-2xl">
            <Grid
              gridData={player2Grid}
              isOwn={true}
              title={selectedGame.player2_name}
              ships={player2Ships}
            />
          </div>
        </div>

        {/* Historique des coups */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-2xl">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Historique des coups ({moves.length})
          </h3>
          <div className="max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {moves.slice().reverse().map((move, idx) => (
                <div
                  key={move.id}
                  className={`
                    p-2 rounded flex items-center justify-between
                    ${move.result === 'HIT' ? 'bg-red-100' : ''}
                    ${move.result === 'SUNK' ? 'bg-red-200' : ''}
                    ${move.result === 'MISS' ? 'bg-blue-100' : ''}
                  `}
                >
                  <span className="text-sm text-gray-600">
                    Coup #{move.move_number}
                  </span>
                  <span className="font-semibold">
                    {move.target_position}
                  </span>
                  <span className={`
                    px-3 py-1 rounded-full text-sm font-bold
                    ${move.result === 'HIT' ? 'bg-red-500 text-white' : ''}
                    ${move.result === 'SUNK' ? 'bg-red-700 text-white' : ''}
                    ${move.result === 'MISS' ? 'bg-blue-500 text-white' : ''}
                  `}>
                    {move.result === 'HIT' ? 'TOUCHÉ' : ''}
                    {move.result === 'SUNK' ? 'COULÉ' : ''}
                    {move.result === 'MISS' ? 'RATÉ' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Spectator;
