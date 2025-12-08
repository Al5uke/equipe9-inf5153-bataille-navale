/**
 * Composant d'animation pour les éclaboussures (tir manqué)
 */
import React, { useEffect, useState } from 'react';
import '../styles/animations.css';

const SplashAnimation = ({ onComplete }) => {
  const [droplets, setDroplets] = useState([]);

  useEffect(() => {
    // Générer les gouttes d'eau
    const newDroplets = [];
    const dropletCount = 8;
    
    for (let i = 0; i < dropletCount; i++) {
      const angle = (i / dropletCount) * 360;
      const distance = 15 + Math.random() * 10;
      const x = Math.cos((angle * Math.PI) / 180) * distance;
      
      newDroplets.push({
        id: i,
        x,
        delay: Math.random() * 0.15
      });
    }
    
    setDroplets(newDroplets);

    // Nettoyer après l'animation
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="splash-container">
      {/* Splash central */}
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-1/2 w-12 h-12 -ml-6 -mt-6 animate-splash">
          <div className="w-full h-full rounded-full bg-gradient-radial from-blue-400 via-blue-300 to-transparent opacity-70" />
        </div>
      </div>
      
      {/* Ondes dans l'eau */}
      <div className="water-ripple" />
      <div 
        className="water-ripple" 
        style={{ animationDelay: '0.15s' }}
      />
      <div 
        className="water-ripple" 
        style={{ animationDelay: '0.3s' }}
      />
      
      {/* Gouttelettes */}
      {droplets.map((droplet) => (
        <div
          key={droplet.id}
          className="water-droplet"
          style={{
            left: `calc(50% + ${droplet.x}px)`,
            top: '50%',
            animationDelay: `${droplet.delay}s`,
            marginLeft: '-3px',
            marginTop: '-3px'
          }}
        />
      ))}
      
      {/* Éclaboussure principale */}
      <div className="absolute left-1/2 top-1/2 -ml-8 -mt-8 w-16 h-16">
        <svg viewBox="0 0 100 100" className="animate-splash">
          <circle cx="50" cy="50" r="40" fill="rgba(59, 130, 246, 0.3)" />
          <circle cx="50" cy="50" r="30" fill="rgba(96, 165, 250, 0.5)" />
          <circle cx="50" cy="50" r="20" fill="rgba(147, 197, 253, 0.7)" />
        </svg>
      </div>
    </div>
  );
};

export default SplashAnimation;
