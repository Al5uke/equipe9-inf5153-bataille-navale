/**
 * Page du classement personnel
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, Award, ArrowLeft, TrendingUp, Target } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Leaderboard = () => {
  const navigate = useNavigate();
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPlayerStats();
  }, []);

  const loadPlayerStats = async () => {
    try {
      const playerStr = localStorage.getItem('battleship_player');
      if (!playerStr) {
        setError('Aucun joueur connecté');
        setLoading(false);
        return;
      }

      const player = JSON.parse(playerStr);
      const response = await axios.get(`${BACKEND_URL}/api/players/${player.id}/ranking`);
      setPlayerStats(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur chargement classement:', err);
      setError('Erreur lors du chargement du classement');
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-12 h-12 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-12 h-12 text-gray-300" />;
    if (rank === 3) return <Award className="w-12 h-12 text-orange-500" />;
    return <span className="text-4xl font-bold" style={{color: '#22c55e'}}>{rank}</span>;
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
          <p className="text-xl" style={{color: '#22c55e'}}>Chargement du classement...</p>
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

      <div className="max-w-4xl mx-auto relative z-10">
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
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Trophy className="w-16 h-16 text-yellow-400" />
            <h1 className="text-5xl font-bold" style={{color: '#22c55e'}}>Vos Statistiques</h1>
            <Trophy className="w-16 h-16 text-yellow-400" />
          </div>
          <p className="text-xl text-gray-300">
            Votre performance dans la bataille navale
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mb-6 bg-red-900 bg-opacity-80 border-2 border-red-500 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {playerStats && (
          <>
            {/* Carte de Rang */}
            <div className="bg-black bg-opacity-80 border-4 p-8 rounded-xl shadow-2xl mb-6" style={{borderColor: '#22c55e'}}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center justify-center w-20 h-20 bg-green-900 bg-opacity-50 rounded-full">
                    {getRankIcon(playerStats.rank)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-1">{playerStats.name}</h2>
                    <p className="text-xl" style={{color: '#22c55e'}}>
                      Rang #{playerStats.rank} sur {playerStats.total_players} joueurs
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm mb-1">Score Total</p>
                  <p className="text-4xl font-bold text-yellow-400">{playerStats.score}</p>
                </div>
              </div>
            </div>

            {/* Statistiques détaillées */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Victoires */}
              <div className="bg-black bg-opacity-80 border-2 p-6 rounded-lg" style={{borderColor: '#22c55e'}}>
                <div className="flex items-center space-x-3 mb-2">
                  <Trophy className="w-8 h-8 text-green-400" />
                  <h3 className="text-lg font-semibold text-gray-300">Victoires</h3>
                </div>
                <p className="text-4xl font-bold text-green-400">{playerStats.victories}</p>
              </div>

              {/* Défaites */}
              <div className="bg-black bg-opacity-80 border-2 p-6 rounded-lg" style={{borderColor: '#22c55e'}}>
                <div className="flex items-center space-x-3 mb-2">
                  <Target className="w-8 h-8 text-red-400" />
                  <h3 className="text-lg font-semibold text-gray-300">Défaites</h3>
                </div>
                <p className="text-4xl font-bold text-red-400">{playerStats.defeats}</p>
              </div>

              {/* Ratio */}
              <div className="bg-black bg-opacity-80 border-2 p-6 rounded-lg" style={{borderColor: '#22c55e'}}>
                <div className="flex items-center space-x-3 mb-2">
                  <TrendingUp className="w-8 h-8 text-blue-400" />
                  <h3 className="text-lg font-semibold text-gray-300">Taux de Victoire</h3>
                </div>
                <p className="text-4xl font-bold text-blue-400">{playerStats.win_rate.toFixed(1)}%</p>
              </div>
            </div>

            {/* Précision */}
            <div className="bg-black bg-opacity-80 border-2 p-6 rounded-lg mb-6" style={{borderColor: '#22c55e'}}>
              <h3 className="text-xl font-bold mb-4" style={{color: '#22c55e'}}>Précision de Tir</h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="bg-gray-700 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all"
                      style={{width: `${playerStats.accuracy}%`}}
                    ></div>
                  </div>
                </div>
                <span className="text-2xl font-bold" style={{color: '#22c55e'}}>
                  {playerStats.accuracy.toFixed(1)}%
                </span>
              </div>
              <div className="mt-3 text-sm text-gray-400">
                {playerStats.successful_shots} tirs réussis sur {playerStats.total_shots} tirs
              </div>
            </div>

            {/* Parties jouées */}
            <div className="bg-black bg-opacity-80 border-2 p-6 rounded-lg text-center" style={{borderColor: '#22c55e'}}>
              <p className="text-gray-400 mb-2">Parties Jouées</p>
              <p className="text-3xl font-bold text-white">{playerStats.total_games}</p>
            </div>
          </>
        )}

        {/* Bouton nouvelle partie */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/game-mode')}
            className="text-white font-bold py-4 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all hover:bg-opacity-90"
            style={{backgroundColor: '#22c55e'}}
            data-testid="new-game-btn"
          >
            Jouer une partie
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
