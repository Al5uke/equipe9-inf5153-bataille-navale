/**
 * Grille - navires qui remplissent COMPLETEMENT les cases
 */
import React from 'react';
import Cell from './Cell';
import ShipVisual from './ShipVisual';
import { ROWS, COLS, NEON_GREEN } from '../utils/constants';

const Grid = ({ 
  gridData, 
  isOwn = false, 
  onCellClick, 
  title,
  highlightedCells = [],
  onCellHover,
  canPlaceShip = true,
  ships = [],
  previewShip = null
}) => {
  const handleCellClick = (position) => {
    if (onCellClick) {
      onCellClick(position);
    }
  };

  const handleCellHover = (position) => {
    if (onCellHover) {
      onCellHover(position);
    }
  };

  const getShipDisplayInfo = (ship) => {
    if (!ship.positions || ship.positions.length === 0) return null;

    const firstPos = ship.positions[0];
    const row = firstPos[0];
    const col = firstPos.substring(1);
    const rowIndex = ROWS.indexOf(row);
    const colIndex = COLS.indexOf(col);

    if (rowIndex === -1 || colIndex === -1) return null;

    return {
      row: rowIndex,
      col: colIndex,
      size: ship.positions.length,
      isHorizontal: ship.orientation === 'HORIZONTAL',
      shipType: ship.ship_type
    };
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-1" style={{color: NEON_GREEN}}>{title}</h3>
        <div className="h-1 w-20 mx-auto rounded-full" style={{backgroundColor: NEON_GREEN}}></div>
      </div>
      
      <div className="inline-block bg-black p-4 rounded-xl shadow-2xl border-4" style={{borderColor: NEON_GREEN}}>
        <div className="flex mb-1">
          <div className="w-8"></div>
          {COLS.map(col => (
            <div key={col} className="w-10 h-8 flex items-center justify-center text-sm font-bold" style={{color: NEON_GREEN}}>
              {col}
            </div>
          ))}
        </div>
        
        <div className="relative">
          {ROWS.map((row, rowIndex) => (
            <div key={row} className="flex">
              <div className="w-8 h-10 flex items-center justify-center text-sm font-bold" style={{color: NEON_GREEN}}>
                {row}
              </div>
              
              {COLS.map((col, colIndex) => {
                const position = `${row}${col}`;
                const cellState = gridData?.[position] || 'EMPTY';
                
                return (
                  <div 
                    key={position} 
                    className="w-10 h-10"
                    onMouseEnter={() => handleCellHover(position)}
                  >
                    <Cell
                      position={position}
                      state={cellState}
                      isOwn={isOwn}
                      onClick={() => handleCellClick(position)}
                      canPlace={canPlaceShip}
                    />
                  </div>
                );
              })}
            </div>
          ))}

          {/* Navires - remplissent COMPLETEMENT les cases */}
          {isOwn && ships && ships.map((ship, idx) => {
            const info = getShipDisplayInfo(ship);
            if (!info) return null;

            // Dimensions exactes de la grille
            const CELL_SIZE = 40;          // w-10 = 40px (taille d'une cellule)
            const LABEL_WIDTH = 32;        // w-8 = 32px (largeur des labels de ligne)

            // Position absolue relative au conteneur parent (div.relative)
            // L'en-tête des colonnes est EN DEHORS de ce conteneur
            // Les labels de ligne sont À L'INTÉRIEUR mais à gauche
            const left = LABEL_WIDTH + (info.col * CELL_SIZE);
            const top = (info.row * CELL_SIZE);

            // Taille - remplit COMPLETEMENT N cases
            const width = info.size * CELL_SIZE;
            const height = CELL_SIZE;

            return (
              <div
                key={`ship-${idx}`}
                style={{
                  position: 'absolute',
                  left: `${left}px`,
                  top: `${top}px`,
                  width: info.isHorizontal ? `${width}px` : `${height}px`,
                  height: info.isHorizontal ? `${height}px` : `${width}px`,
                  pointerEvents: 'none',
                  zIndex: 50
                }}
              >
                <ShipVisual
                  shipType={info.shipType}
                  size={info.size}
                  orientation={ship.orientation}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Grid;
