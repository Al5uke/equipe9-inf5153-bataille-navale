/**
 * Navires 3D réalistes vus d'en haut avec détails
 */
import React from 'react';

const ShipVisual = ({ shipType, size, orientation }) => {
  const isHorizontal = orientation === 'HORIZONTAL';
  
  const getShip3D = () => {
    const baseStyle = {
      width: '100%',
      height: '100%'
    };

    switch(shipType) {
      case 'PORTE_AVION': // 5 cases - Porte-avions avec piste et îlot
        if (isHorizontal) {
          return (
            <svg viewBox="0 0 500 100" style={baseStyle} preserveAspectRatio="none">
              {/* Coque principale */}
              <rect x="0" y="25" width="500" height="50" fill="#2c3e50" stroke="#1a252f" strokeWidth="2"/>
              {/* Pont d'envol */}
              <rect x="0" y="30" width="500" height="40" fill="#34495e"/>
              {/* Marques de piste */}
              <line x1="50" y1="40" x2="70" y2="40" stroke="#f1c40f" strokeWidth="2"/>
              <line x1="50" y1="60" x2="70" y2="60" stroke="#f1c40f" strokeWidth="2"/>
              <line x1="150" y1="40" x2="170" y2="40" stroke="#f1c40f" strokeWidth="2"/>
              <line x1="150" y1="60" x2="170" y2="60" stroke="#f1c40f" strokeWidth="2"/>
              {/* Îlot de contrôle */}
              <rect x="350" y="15" width="80" height="35" fill="#1a252f"/>
              <rect x="360" y="10" width="60" height="15" fill="#2c3e50"/>
              {/* Antennes */}
              <rect x="385" y="5" width="4" height="10" fill="#7f8c8d"/>
              <circle cx="387" cy="3" r="3" fill="#e74c3c"/>
              {/* Avions */}
              <ellipse cx="100" cy="50" rx="15" ry="8" fill="#7f8c8d"/>
              <ellipse cx="250" cy="50" rx="15" ry="8" fill="#7f8c8d"/>
            </svg>
          );
        } else {
          return (
            <svg viewBox="0 0 100 500" style={baseStyle} preserveAspectRatio="none">
              <rect x="25" y="0" width="50" height="500" fill="#2c3e50" stroke="#1a252f" strokeWidth="2"/>
              <rect x="30" y="0" width="40" height="500" fill="#34495e"/>
              <line x1="40" y1="50" x2="40" y2="70" stroke="#f1c40f" strokeWidth="2"/>
              <line x1="60" y1="50" x2="60" y2="70" stroke="#f1c40f" strokeWidth="2"/>
              <line x1="40" y1="150" x2="40" y2="170" stroke="#f1c40f" strokeWidth="2"/>
              <line x1="60" y1="150" x2="60" y2="170" stroke="#f1c40f" strokeWidth="2"/>
              <rect x="15" y="350" width="35" height="80" fill="#1a252f"/>
              <rect x="10" y="360" width="15" height="60" fill="#2c3e50"/>
              <rect x="5" y="385" width="10" height="4" fill="#7f8c8d"/>
              <circle cx="3" cy="387" r="3" fill="#e74c3c"/>
              <ellipse cx="50" cy="100" rx="8" ry="15" fill="#7f8c8d"/>
              <ellipse cx="50" cy="250" rx="8" ry="15" fill="#7f8c8d"/>
            </svg>
          );
        }

      case 'CROISEUR': // 4 cases - Croiseur avec tourelles
        if (isHorizontal) {
          return (
            <svg viewBox="0 0 400 100" style={baseStyle} preserveAspectRatio="none">
              <path d="M 10 40 L 0 50 L 0 50 L 10 60 L 390 60 L 400 50 L 390 40 Z" fill="#2c3e50" stroke="#1a252f" strokeWidth="2"/>
              <rect x="10" y="42" width="380" height="16" fill="#34495e"/>
              <rect x="150" y="25" width="100" height="30" fill="#1a252f"/>
              <rect x="160" y="18" width="80" height="12" fill="#2c3e50"/>
              <circle cx="80" cy="50" r="12" fill="#1a252f"/>
              <rect x="77" y="35" width="6" height="20" fill="#34495e"/>
              <circle cx="320" cy="50" r="12" fill="#1a252f"/>
              <rect x="317" y="35" width="6" height="20" fill="#34495e"/>
              <rect x="195" y="12" width="3" height="10" fill="#7f8c8d"/>
              <circle cx="196.5" cy="10" r="3" fill="#3498db"/>
            </svg>
          );
        } else {
          return (
            <svg viewBox="0 0 100 400" style={baseStyle} preserveAspectRatio="none">
              <path d="M 40 10 L 50 0 L 50 0 L 60 10 L 60 390 L 50 400 L 40 390 Z" fill="#2c3e50" stroke="#1a252f" strokeWidth="2"/>
              <rect x="42" y="10" width="16" height="380" fill="#34495e"/>
              <rect x="25" y="150" width="30" height="100" fill="#1a252f"/>
              <rect x="18" y="160" width="12" height="80" fill="#2c3e50"/>
              <circle cx="50" cy="80" r="12" fill="#1a252f"/>
              <rect x="35" y="77" width="20" height="6" fill="#34495e"/>
              <circle cx="50" cy="320" r="12" fill="#1a252f"/>
              <rect x="35" y="317" width="20" height="6" fill="#34495e"/>
              <rect x="12" y="195" width="10" height="3" fill="#7f8c8d"/>
              <circle cx="10" cy="196.5" r="3" fill="#3498db"/>
            </svg>
          );
        }

      case 'SOUS_MARIN': // 3 cases - Sous-marin avec kiosque
        if (isHorizontal) {
          return (
            <svg viewBox="0 0 300 100" style={baseStyle} preserveAspectRatio="none">
              <ellipse cx="150" cy="50" rx="145" ry="18" fill="#1a252f"/>
              <ellipse cx="150" cy="50" rx="140" ry="14" fill="#2c3e50"/>
              <rect x="130" y="32" width="40" height="18" fill="#1a252f"/>
              <rect x="135" y="28" width="30" height="8" fill="#34495e"/>
              <rect x="147" y="20" width="6" height="14" fill="#7f8c8d"/>
              <circle cx="150" cy="18" r="4" fill="#3498db"/>
              <line x1="50" y1="50" x2="250" y2="50" stroke="#34495e" strokeWidth="2"/>
            </svg>
          );
        } else {
          return (
            <svg viewBox="0 0 100 300" style={baseStyle} preserveAspectRatio="none">
              <ellipse cx="50" cy="150" rx="18" ry="145" fill="#1a252f"/>
              <ellipse cx="50" cy="150" rx="14" ry="140" fill="#2c3e50"/>
              <rect x="32" y="130" width="18" height="40" fill="#1a252f"/>
              <rect x="28" y="135" width="8" height="30" fill="#34495e"/>
              <rect x="20" y="147" width="14" height="6" fill="#7f8c8d"/>
              <circle cx="18" cy="150" r="4" fill="#3498db"/>
              <line x1="50" y1="50" x2="50" y2="250" stroke="#34495e" strokeWidth="2"/>
            </svg>
          );
        }

      case 'CONTRE_TORPILLEUR': // 3 cases - Destroyer avec hélipad
        if (isHorizontal) {
          return (
            <svg viewBox="0 0 300 100" style={baseStyle} preserveAspectRatio="none">
              <path d="M 15 40 L 5 50 L 15 60 L 285 60 L 295 50 L 285 40 Z" fill="#2c3e50" stroke="#1a252f" strokeWidth="2"/>
              <rect x="15" y="42" width="270" height="16" fill="#34495e"/>
              <rect x="80" y="25" width="60" height="30" fill="#1a252f"/>
              <rect x="90" y="18" width="40" height="12" fill="#2c3e50"/>
              <circle cx="40" cy="50" r="10" fill="#1a252f"/>
              <rect x="37" y="38" width="6" height="16" fill="#34495e"/>
              <circle cx="240" cy="50" r="25" stroke="#f1c40f" strokeWidth="3" fill="none"/>
              <line x1="240" y1="25" x2="240" y2="75" stroke="#f1c40f" strokeWidth="2"/>
              <line x1="215" y1="50" x2="265" y2="50" stroke="#f1c40f" strokeWidth="2"/>
              <rect x="107" y="12" width="3" height="10" fill="#7f8c8d"/>
              <rect x="102" y="10" width="13" height="4" fill="#3498db"/>
            </svg>
          );
        } else {
          return (
            <svg viewBox="0 0 100 300" style={baseStyle} preserveAspectRatio="none">
              <path d="M 40 15 L 50 5 L 60 15 L 60 285 L 50 295 L 40 285 Z" fill="#2c3e50" stroke="#1a252f" strokeWidth="2"/>
              <rect x="42" y="15" width="16" height="270" fill="#34495e"/>
              <rect x="25" y="80" width="30" height="60" fill="#1a252f"/>
              <rect x="18" y="90" width="12" height="40" fill="#2c3e50"/>
              <circle cx="50" cy="40" r="10" fill="#1a252f"/>
              <rect x="38" y="37" width="16" height="6" fill="#34495e"/>
              <circle cx="50" cy="240" r="25" stroke="#f1c40f" strokeWidth="3" fill="none"/>
              <line x1="25" y1="240" x2="75" y2="240" stroke="#f1c40f" strokeWidth="2"/>
              <line x1="50" y1="215" x2="50" y2="265" stroke="#f1c40f" strokeWidth="2"/>
              <rect x="12" y="107" width="10" height="3" fill="#7f8c8d"/>
              <rect x="10" y="102" width="4" height="13" fill="#3498db"/>
            </svg>
          );
        }

      case 'TORPILLEUR': // 2 cases - Petit navire rapide
        if (isHorizontal) {
          return (
            <svg viewBox="0 0 200 100" style={baseStyle} preserveAspectRatio="none">
              <path d="M 20 40 L 10 50 L 20 60 L 180 60 L 190 50 L 180 40 Z" fill="#2c3e50" stroke="#1a252f" strokeWidth="2"/>
              <rect x="20" y="42" width="160" height="16" fill="#34495e"/>
              <rect x="70" y="28" width="60" height="28" fill="#1a252f"/>
              <rect x="75" y="22" width="50" height="10" fill="#2c3e50"/>
              <circle cx="35" cy="50" r="8" fill="#1a252f"/>
              <rect x="32" y="40" width="6" height="14" fill="#34495e"/>
              <circle cx="160" cy="50" r="6" fill="#1a252f"/>
              <rect x="97" y="16" width="3" height="10" fill="#7f8c8d"/>
              <circle cx="98.5" cy="14" r="2" fill="#e74c3c"/>
            </svg>
          );
        } else {
          return (
            <svg viewBox="0 0 100 200" style={baseStyle} preserveAspectRatio="none">
              <path d="M 40 20 L 50 10 L 60 20 L 60 180 L 50 190 L 40 180 Z" fill="#2c3e50" stroke="#1a252f" strokeWidth="2"/>
              <rect x="42" y="20" width="16" height="160" fill="#34495e"/>
              <rect x="28" y="70" width="28" height="60" fill="#1a252f"/>
              <rect x="22" y="75" width="10" height="50" fill="#2c3e50"/>
              <circle cx="50" cy="35" r="8" fill="#1a252f"/>
              <rect x="40" y="32" width="14" height="6" fill="#34495e"/>
              <circle cx="50" cy="160" r="6" fill="#1a252f"/>
              <rect x="16" y="97" width="10" height="3" fill="#7f8c8d"/>
              <circle cx="14" cy="98.5" r="2" fill="#e74c3c"/>
            </svg>
          );
        }

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full">
      {getShip3D()}
    </div>
  );
};

export default ShipVisual;
