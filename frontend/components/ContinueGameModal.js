/**
 * Modal pour demander si le joueur veut continuer sa partie en cours
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, RotateCcw, X } from 'lucide-react';

// Styles d'animation rapides (inline pour performance)
const modalStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes scaleIn {
    from { 
      opacity: 0;
      transform: scale(0.9);
    }
    to { 
      opacity: 1;
      transform: scale(1);
    }
  }
`;

// Injecter les styles
if (typeof document !== 'undefined') {
  const styleId = 'continue-modal-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = modalStyles;
    document.head.appendChild(style);
  }
}

const ContinueGameModal = ({ gameData, onClose }) => {
  const navigate = useNavigate();

  const handleContinue = () => {
    // Restaurer le game_id et rediriger vers la partie
    localStorage.setItem('current_game_id', gameData.gameId);
    localStorage.setItem('game_mode', gameData.mode);
    navigate(`/game/${gameData.gameId}`);
    onClose();
  };

  const handleNewGame = () => {
    // Nettoyer la partie en cours
    localStorage.removeItem('ongoing_ai_game');
    localStorage.removeItem('current_game_id');
    onClose();
  };

  const getModeLabel = () => {
    if (gameData.mode === 'HUMAN_VS_AI_RANDOM') return 'IA Débutant';
    if (gameData.mode === 'HUMAN_VS_AI_TARGETED') return 'IA Avancé';
    return 'IA';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80" style={{ animation: 'fadeIn 0.15s ease-out' }}>
      {/* Overlay */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative bg-black border-4 rounded-2xl shadow-2xl max-w-md w-full p-6" style={{ borderColor: '#22c55e', animation: 'scaleIn 0.2s ease-out' }}>
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Icône */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center border-4" style={{ borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
            <Play className="w-8 h-8" style={{ color: '#22c55e' }} />
          </div>
        </div>

        {/* Titre */}
        <h2 className="text-2xl font-bold text-center mb-2" style={{ color: '#22c55e' }}>
          Partie en cours détectée
        </h2>

        {/* Message */}
        <p className="text-gray-300 text-center mb-6">
          Vous avez une partie en cours contre <span className="font-bold" style={{ color: '#22c55e' }}>{getModeLabel()}</span>.
          <br />
          Voulez-vous continuer cette partie ?
        </p>

        {/* Détails de la partie */}
        <div className="bg-gray-900 bg-opacity-50 rounded-lg p-4 mb-6 border-2 border-gray-700">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-400">Mode</p>
              <p className="font-bold text-white">{getModeLabel()}</p>
            </div>
            <div>
              <p className="text-gray-400">Statut</p>
              <p className="font-bold" style={{ color: '#22c55e' }}>
                {gameData.status === 'IN_PROGRESS' ? 'En cours' : 'Placement navires'}
              </p>
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex flex-col space-y-3">
          {/* Continuer */}
          <button
            onClick={handleContinue}
            className="w-full py-4 rounded-lg font-bold text-white transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 border-2"
            style={{ 
              backgroundColor: '#22c55e',
              borderColor: '#16a34a'
            }}
          >
            <Play className="w-5 h-5" />
            <span>Continuer la partie</span>
          </button>

          {/* Nouvelle partie */}
          <button
            onClick={handleNewGame}
            className="w-full py-4 rounded-lg font-bold text-white bg-gray-800 border-2 border-gray-600 transition-all transform hover:scale-105 active:scale-95 hover:bg-gray-700 flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Nouvelle partie</span>
          </button>
        </div>

        {/* Note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          ⚠️ Démarrer une nouvelle partie supprimera la partie en cours
        </p>
      </div>
    </div>
  );
};

export default ContinueGameModal;
