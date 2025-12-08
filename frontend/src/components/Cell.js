/**
 * Composant Case de grille - Style néon vert sur noir avec animations
 */
import React, { useState, useEffect } from 'react';
import { CELL_STATES, NEON_GREEN } from '../utils/constants';
import HitAnimation from './HitAnimation';
import SplashAnimation from './SplashAnimation';
import '../styles/animations.css';

const Cell = ({ 
  position, 
  state, 
  isOwn, 
  onClick, 
  isHighlighted,
  canPlace,
  showAnimation = true
}) => {
  const [previousState, setPreviousState] = useState(state);
  const [animationType, setAnimationType] = useState(null);

  // Détecter le changement d'état pour déclencher l'animation
  useEffect(() => {
    if (showAnimation && previousState !== state) {
      if (state === CELL_STATES.HIT) {
        setAnimationType('hit');
        setTimeout(() => setAnimationType(null), 800);
      } else if (state === CELL_STATES.MISS) {
        setAnimationType('miss');
        setTimeout(() => setAnimationType(null), 800);
      }
      setPreviousState(state);
    }
  }, [state, previousState, showAnimation]);

  const getCellStyle = () => {
    const baseStyle = 'w-full h-full flex items-center justify-center text-center font-bold transition-all duration-150 relative';
    
    // Pour la grille du joueur
    if (isOwn) {
      if (state === CELL_STATES.HIT) {
        return `${baseStyle} bg-red-600 border-2 border-red-400 shadow-lg z-20 animate-pulse-hit`;
      }
      if (state === CELL_STATES.MISS) {
        return `${baseStyle} bg-blue-400 border-2 border-blue-300 z-10`;
      }
      if (state === CELL_STATES.SHIP) {
        // Transparent pour laisser voir le navire en dessous
        return `${baseStyle} bg-transparent border-2 z-0`;
      }
      return `${baseStyle} bg-black border-2 hover:bg-gray-900 z-0`;
    }
    
    // Pour la grille adversaire
    if (state === CELL_STATES.HIT) {
      return `${baseStyle} bg-red-600 border-2 border-red-400 shadow-lg cursor-not-allowed z-20 animate-pulse-hit`;
    }
    if (state === CELL_STATES.MISS) {
      return `${baseStyle} bg-blue-400 border-2 border-blue-300 cursor-not-allowed z-10`;
    }
    
    return `${baseStyle} bg-black border-2 hover:bg-gray-900 hover:shadow-lg cursor-crosshair active:scale-95 z-0`;
  };

  const getCellContent = () => {
    if (state === CELL_STATES.HIT) {
      return (
        <div className="w-full h-full flex items-center justify-center animate-pulse z-30">
          <span className="text-3xl font-bold text-white drop-shadow-lg">💥</span>
        </div>
      );
    }
    if (state === CELL_STATES.MISS) {
      return (
        <div className="w-full h-full flex items-center justify-center z-30">
          <span className="text-2xl">💦</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      data-testid={`cell-${position}`}
      onClick={onClick}
      className={`
        aspect-square
        ${getCellStyle()}
        overflow-visible
      `}
      style={{
        borderColor: NEON_GREEN
      }}
      title={position}
    >
      {getCellContent()}
      
      {/* Animations dynamiques */}
      {animationType === 'hit' && (
        <div className="absolute inset-0 pointer-events-none z-50 animate-shake">
          <HitAnimation />
        </div>
      )}
      {animationType === 'miss' && (
        <div className="absolute inset-0 pointer-events-none z-50">
          <SplashAnimation />
        </div>
      )}
    </div>
  );
};

export default Cell;
