/**
 * Page d'attente matchmaking
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Loader } from 'lucide-react';
import { checkMatchmaking, leaveMatchmaking } from '../utils/api';

const Matchmaking = () => {
  const navigate = useNavigate();
  const [waiting, setWaiting] = useState(true);
  const [dots, setDots] = useState('.');

  const player = JSON.parse(localStorage.getItem('battleship_player') || '{}');

  // Animation des points
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '.';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Vérifier le matchmaking toutes les 2 secondes
  useEffect(() => {
    const checkInterval = setInterval(async () => {
      try {
        const result = await checkMatchmaking(player.id);

        if (result.matched) {
          localStorage.setItem('current_game_id', result.game_id);
          localStorage.setItem('opponent_name', result.opponent_name);
          navigate('/place-ships');
        }
      } catch (err) {
        console.error('Erreur vérification match:', err);
      }
    }, 2000);

    return () => clearInterval(checkInterval);
  }, [player.id, navigate]);

  const handleCancel = async () => {
    try {
      await leaveMatchmaking(player.id);
      navigate('/game-mode');
    } catch (err) {
      console.error('Erreur annulation:', err);
      navigate('/game-mode');
    }
  };

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

      {/* Grille verte */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(34, 197, 94, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.4) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="bg-black bg-opacity-80 border-4 p-12 rounded-2xl shadow-2xl text-center max-w-md w-full relative z-10" style={{borderColor: '#22c55e'}}>
        {/* Animation */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-8 rounded-full animate-ping" style={{borderColor: 'rgba(34, 197, 94, 0.3)'}}></div>
          </div>
          <div className="relative flex items-center justify-center">
            <Users className="w-24 h-24 animate-pulse" style={{color: '#22c55e'}} />
          </div>
        </div>

        {/* Titre */}
        <h1 className="text-3xl font-bold mb-4" style={{color: '#22c55e'}}>
          Recherche d'un adversaire{dots}
        </h1>

        <p className="text-gray-300 mb-8">
          Veuillez patienter pendant que nous trouvons un adversaire digne de vous!
        </p>

        {/* Indicateur de chargement */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <Loader className="w-6 h-6 animate-spin" style={{color: '#22c55e'}} />
          <span className="font-semibold" style={{color: '#22c55e'}}>En attente...</span>
        </div>

        {/* Bouton annuler */}
        <button
          onClick={handleCancel}
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-lg transition-colors w-full"
          data-testid="cancel-btn"
        >
          Annuler
        </button>

        {/* Info */}
        <div className="mt-8 text-sm text-gray-400">
          <p>✨ Astuce: Pendant que vous attendez, pourquoi ne pas inviter un ami à jouer?</p>
        </div>
      </div>
    </div>
  );
};

export default Matchmaking;
