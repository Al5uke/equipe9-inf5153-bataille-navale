/**
 * Composant d'animation pour les explosions (tir réussi)
 */
import React, { useEffect, useState } from 'react';
import '../styles/animations.css';

const HitAnimation = ({ onComplete }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Générer les particules d'explosion
    const newParticles = [];
    const particleCount = 12;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * 360;
      const distance = 30 + Math.random() * 20;
      const tx = Math.cos((angle * Math.PI) / 180) * distance;
      const ty = Math.sin((angle * Math.PI) / 180) * distance;
      
      newParticles.push({
        id: i,
        tx,
        ty,
        delay: Math.random() * 0.1
      });
    }
    
    setParticles(newParticles);

    // Nettoyer après l'animation
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="explosion-container">
      {/* Glow central */}
      <div className="explosion-glow" />
      
      {/* Onde de choc */}
      <div className="absolute inset-0 animate-shockwave rounded-full border-4 border-red-500 opacity-60" />
      <div 
        className="absolute inset-0 animate-shockwave rounded-full border-4 border-orange-400 opacity-40" 
        style={{ animationDelay: '0.1s' }}
      />
      
      {/* Particules */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="explosion-particle"
          style={{
            '--tx': `${particle.tx}px`,
            '--ty': `${particle.ty}px`,
            animationDelay: `${particle.delay}s`,
            left: '50%',
            top: '50%',
            marginLeft: '-4px',
            marginTop: '-4px'
          }}
        />
      ))}
      
      {/* Fumée */}
      <div className="absolute inset-0">
        <div 
          className="absolute left-1/2 top-1/2 w-8 h-8 -ml-4 -mt-4 bg-gray-700 rounded-full opacity-60 animate-smoke"
          style={{ animationDelay: '0.2s' }}
        />
        <div 
          className="absolute left-1/2 top-1/2 w-6 h-6 -ml-3 -mt-3 bg-gray-600 rounded-full opacity-40 animate-smoke"
          style={{ animationDelay: '0.3s' }}
        />
      </div>
      
      {/* Flash d'impact */}
      <div className="absolute inset-0 bg-white rounded animate-explosion opacity-90" />
    </div>
  );
};

export default HitAnimation;
