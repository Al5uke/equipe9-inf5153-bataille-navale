/**
 * Panneau VOTRE FLOTTE - Affiche les navires disponibles et leur état
 */
import React from 'react';
import { SHIPS_TO_PLACE, NEON_GREEN } from '../utils/constants';

const FleetPanel = ({ placedShips = [], currentShipIndex = 0 }) => {
  // Vérifier si un navire est placé
  const isShipPlaced = (shipIndex) => {
    return shipIndex < placedShips.length;
  };

  // Vérifier si un navire est en cours de placement
  const isShipCurrent = (shipIndex) => {
    return shipIndex === currentShipIndex && !isShipPlaced(shipIndex);
  };

  // Vérifier si un navire est à placer (après le navire courant)
  const isShipPending = (shipIndex) => {
    return shipIndex > currentShipIndex;
  };

  return (
    <div className="bg-black border-4 rounded-xl p-4 shadow-2xl" style={{ borderColor: NEON_GREEN }}>
      <h3 
        className="text-xl font-bold text-center mb-4 pb-2 border-b-2" 
        style={{ color: NEON_GREEN, borderColor: NEON_GREEN }}
      >
        ⚓ VOTRE FLOTTE ⚓
      </h3>
      
      <div className="space-y-3">
        {SHIPS_TO_PLACE.map((ship, index) => {
          const placed = isShipPlaced(index);
          const current = isShipCurrent(index);
          const pending = isShipPending(index);

          return (
            <div
              key={ship.type}
              className={`
                p-3 rounded-lg border-2 transition-all duration-300
                ${placed ? 'bg-green-900/30 border-green-500' : ''}
                ${current ? 'bg-yellow-900/30 border-yellow-500 animate-pulse' : ''}
                ${pending ? 'bg-gray-900/30 border-gray-600' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{ship.emoji}</span>
                  <div>
                    <div 
                      className="font-bold text-sm"
                      style={{ color: placed ? '#22c55e' : current ? '#eab308' : '#6b7280' }}
                    >
                      {ship.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {ship.size} case{ship.size > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  {placed && (
                    <div className="flex items-center space-x-1">
                      <span className="text-green-500 text-lg">✓</span>
                      <span className="text-xs text-green-500 font-bold">Placé</span>
                    </div>
                  )}
                  {current && (
                    <div className="text-xs text-yellow-500 font-bold">
                      En cours
                    </div>
                  )}
                  {pending && (
                    <div className="text-xs text-gray-500">
                      En attente
                    </div>
                  )}
                </div>
              </div>
              
              {/* Barre de progression visuelle */}
              <div className="mt-2 flex space-x-1">
                {[...Array(ship.size)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-1 rounded"
                    style={{
                      backgroundColor: placed ? NEON_GREEN : current ? '#eab308' : '#374151'
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Statistiques */}
      <div className="mt-4 pt-4 border-t-2" style={{ borderColor: NEON_GREEN }}>
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div>
            <div className="text-gray-400">Placés</div>
            <div className="text-lg font-bold" style={{ color: NEON_GREEN }}>
              {placedShips.length}/{SHIPS_TO_PLACE.length}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Restants</div>
            <div className="text-lg font-bold text-yellow-500">
              {SHIPS_TO_PLACE.length - placedShips.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetPanel;
