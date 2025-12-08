/**
 * Composant wrapper pour ajouter des animations aux cases de la grille
 */
import React, { useState, useEffect } from 'react';
import HitAnimation from './HitAnimation';
import SplashAnimation from './SplashAnimation';

const CellAnimation = ({ type, children, onAnimationComplete }) => {
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    setShowAnimation(true);
  }, [type]);

  const handleComplete = () => {
    setShowAnimation(false);
    if (onAnimationComplete) {
      onAnimationComplete();
    }
  };

  return (
    <div className="relative w-full h-full">
      {children}
      {showAnimation && type === 'hit' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <HitAnimation onComplete={handleComplete} />
        </div>
      )}
      {showAnimation && type === 'miss' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <SplashAnimation onComplete={handleComplete} />
        </div>
      )}
    </div>
  );
};

export default CellAnimation;
