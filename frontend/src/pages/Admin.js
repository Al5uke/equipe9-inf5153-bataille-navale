/**
 * Page Admin - Gestion des joueurs et base de données
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Users, RefreshCw } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Admin = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  // Mot de passe admin
  const ADMIN_PASSWORD = 'admin123';

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
      loadPlayers();
      loadStats();
    } else {
      setError('Mot de passe incorrect');
    }
  };

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/admin/players`);
      setPlayers(response.data);
    } catch (err) {
      console.error('Erreur chargement joueurs:', err);
      setError('Erreur lors du chargement des joueurs');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/admin/stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Erreur chargement stats:', err);
    }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('ATTENTION : Voulez-vous vraiment réinitialiser TOUTE la base de données ? Cette action est IRRÉVERSIBLE !')) {
      return;
    }

    if (!window.confirm('Êtes-vous ABSOLUMENT sûr ? Tous les joueurs et parties seront supprimés définitivement.')) {
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${BACKEND_URL}/api/admin/reset-database`);
      alert('Base de données réinitialisée avec succès !');
      setPlayers([]);
      loadStats();
    } catch (err) {
      console.error('Erreur réinitialisation:', err);
      alert('Erreur lors de la réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlayer = async (playerId, playerName) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer le joueur "${playerName}" ?`)) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${BACKEND_URL}/api/admin/players/${playerId}`);
      alert(`Joueur "${playerName}" supprimé avec succès`);
      loadPlayers();
      loadStats();
    } catch (err) {
      console.error('Erreur suppression joueur:', err);
      alert('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        {/* Image de fond */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1758291293507-777a405ad492?w=1920&q=80)',
            filter: 'brightness(0.6)'
          }}
        />
        <div className="absolute inset-0 bg-black opacity-50" />

        <div className="max-w-md w-full relative z-10">
          <button
            onClick={() => navigate('/')}
            className="mb-6 flex items-center space-x-2 text-white hover:text-green-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>

          <div className="bg-black bg-opacity-80 border-4 p-8 rounded-xl shadow-2xl" style={{borderColor: '#22c55e'}}>
            <h1 className="text-3xl font-bold mb-6 text-center" style={{color: '#22c55e'}}>
              Administration
            </h1>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-3 border-2 border-green-500 bg-black text-green-400 rounded-lg focus:border-green-400 focus:outline-none"
                  placeholder="Entrez le mot de passe admin"
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-900 bg-opacity-50 border-2 border-red-500 text-red-200 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full text-white font-bold py-3 rounded-lg transition-colors hover:bg-opacity-90"
                style={{backgroundColor: '#22c55e'}}
              >
                Se connecter
              </button>
            </form>
          </div>
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

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-white hover:text-green-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>

          <h1 className="text-4xl font-bold" style={{color: '#22c55e'}}>
            Administration
          </h1>

          <div className="w-32"></div>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-black bg-opacity-80 border-2 p-4 rounded-lg" style={{borderColor: '#22c55e'}}>
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8" style={{color: '#22c55e'}} />
                <div>
                  <p className="text-gray-400 text-sm">Total Joueurs</p>
                  <p className="text-2xl font-bold text-white">{stats.total_players}</p>
                </div>
              </div>
            </div>

            <div className="bg-black bg-opacity-80 border-2 p-4 rounded-lg" style={{borderColor: '#22c55e'}}>
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-8 h-8" style={{color: '#22c55e'}} />
                <div>
                  <p className="text-gray-400 text-sm">Total Parties</p>
                  <p className="text-2xl font-bold text-white">{stats.total_games}</p>
                </div>
              </div>
            </div>

            <div className="bg-black bg-opacity-80 border-2 p-4 rounded-lg" style={{borderColor: '#22c55e'}}>
              <div className="flex items-center space-x-3">
                <Trash2 className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-gray-400 text-sm">Actions</p>
                  <button
                    onClick={handleResetDatabase}
                    disabled={loading}
                    className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded mt-1 disabled:opacity-50"
                  >
                    Réinitialiser DB
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Liste des joueurs */}
        <div className="bg-black bg-opacity-80 border-4 p-6 rounded-xl shadow-2xl" style={{borderColor: '#22c55e'}}>
          <h2 className="text-2xl font-bold mb-4" style={{color: '#22c55e'}}>
            Liste des Joueurs
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 mx-auto mb-4" style={{borderColor: '#22c55e'}}></div>
              <p className="text-gray-400">Chargement...</p>
            </div>
          ) : players.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Aucun joueur enregistré</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2" style={{borderColor: '#22c55e'}}>
                    <th className="py-3 px-4 text-gray-300">Nom</th>
                    <th className="py-3 px-4 text-gray-300">Email</th>
                    <th className="py-3 px-4 text-gray-300">Victoires</th>
                    <th className="py-3 px-4 text-gray-300">Défaites</th>
                    <th className="py-3 px-4 text-gray-300">Précision</th>
                    <th className="py-3 px-4 text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr key={player.id} className="border-b border-gray-700 hover:bg-green-900 hover:bg-opacity-20">
                      <td className="py-3 px-4 text-white font-semibold">{player.name}</td>
                      <td className="py-3 px-4 text-gray-400">{player.email || '-'}</td>
                      <td className="py-3 px-4 text-green-400">{player.victories}</td>
                      <td className="py-3 px-4 text-red-400">{player.defeats}</td>
                      <td className="py-3 px-4 text-blue-400">{player.accuracy ? `${player.accuracy.toFixed(1)}%` : '0%'}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDeletePlayer(player.id, player.name)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Supprimer</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 bg-yellow-900 bg-opacity-50 border-2 border-yellow-500 p-4 rounded-lg">
          <p className="text-yellow-200 text-sm">
            <strong>Attention :</strong> La suppression d'un joueur ou la réinitialisation de la base de données sont des actions irréversibles.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Admin;
