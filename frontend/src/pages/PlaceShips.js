/**
 * Page de placement des navires
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCw, Shuffle, Send, ArrowLeft } from 'lucide-react';
import Grid from '../components/Grid';
import FleetPanel from '../components/FleetPanel';
import { SHIPS_TO_PLACE, ROWS, COLS, ORIENTATIONS } from '../utils/constants';
import { placeShips, placeShipsRandom } from '../utils/api';

const PlaceShips = () => {
  const navigate = useNavigate();
  const [gridData, setGridData] = useState({});
  const [placedShips, setPlacedShips] = useState([]);
  const [currentShipIndex, setCurrentShipIndex] = useState(0);
  const [orientation, setOrientation] = useState(ORIENTATIONS.HORIZONTAL);
  const [hoveredCells, setHoveredCells] = useState([]);
  const [canPlace, setCanPlace] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialiser la grille vide
  useEffect(() => {
    const emptyGrid = {};
    ROWS.forEach(row => {
      COLS.forEach(col => {
        emptyGrid[`${row}${col}`] = 'EMPTY';
      });
    });
    setGridData(emptyGrid);
  }, []);

  // Calculer les positions d'un navire
  const getShipPositions = (startPos, size, orient) => {
    if (!startPos) return [];

    const row = startPos[0];
    const col = startPos.substring(1);
    const rowIndex = ROWS.indexOf(row);
    const colIndex = COLS.indexOf(col);

    const positions = [startPos];

    if (orient === ORIENTATIONS.HORIZONTAL) {
      for (let i = 1; i < size; i++) {
        if (colIndex + i >= COLS.length) return [];
        positions.push(`${row}${COLS[colIndex + i]}`);
      }
    } else {
      for (let i = 1; i < size; i++) {
        if (rowIndex + i >= ROWS.length) return [];
        positions.push(`${ROWS[rowIndex + i]}${col}`);
      }
    }

    return positions;
  };

  // Vérifier si le placement est valide
  const canPlaceShip = (positions) => {
    if (positions.length === 0) return false;

    for (const pos of positions) {
      if (gridData[pos] !== 'EMPTY') {
        return false;
      }
    }

    return true;
  };

  // Gérer le survol de la souris
  const handleCellHover = (position) => {
    if (currentShipIndex >= SHIPS_TO_PLACE.length) return;

    const ship = SHIPS_TO_PLACE[currentShipIndex];
    const positions = getShipPositions(position, ship.size, orientation);

    setHoveredCells(positions);
    setCanPlace(canPlaceShip(positions));
  };

  // Wrapper pour gérer le hover
  const handleMouseEnter = (position) => {
    handleCellHover(position);
  };

  // Créer le preview du navire
  const getPreviewShip = () => {
    if (currentShipIndex >= SHIPS_TO_PLACE.length || hoveredCells.length === 0) return null;

    const ship = SHIPS_TO_PLACE[currentShipIndex];
    const firstPos = hoveredCells[0];
    const row = firstPos[0];
    const col = firstPos.substring(1);
    const rowIndex = ROWS.indexOf(row);
    const colIndex = COLS.indexOf(col);

    if (rowIndex === -1 || colIndex === -1) return null;

    return {
      row: rowIndex,
      col: colIndex,
      size: ship.size,
      isHorizontal: orientation === ORIENTATIONS.HORIZONTAL,
      shipType: ship.type,
      positions: hoveredCells,
      canPlace
    };
  };

  // Placer un navire
  const handleCellClick = (position) => {
    if (currentShipIndex >= SHIPS_TO_PLACE.length) return;
    if (!canPlace) return;

    const ship = SHIPS_TO_PLACE[currentShipIndex];
    const positions = getShipPositions(position, ship.size, orientation);

    // Mettre à jour la grille
    const newGrid = { ...gridData };
    positions.forEach(pos => {
      newGrid[pos] = 'SHIP';
    });

    // Enregistrer le navire placé
    const newShip = {
      ship_type: ship.type,
      size: ship.size,
      positions: positions,
      orientation: orientation
    };

    setGridData(newGrid);
    setPlacedShips([...placedShips, newShip]);
    setCurrentShipIndex(currentShipIndex + 1);
    setHoveredCells([]);
    setCanPlace(false);
  };

  // Changer l'orientation
  const toggleOrientation = () => {
    setOrientation(
      orientation === ORIENTATIONS.HORIZONTAL
        ? ORIENTATIONS.VERTICAL
        : ORIENTATIONS.HORIZONTAL
    );
  };

  // Placement aléatoire
  const handleRandomPlacement = async () => {
    try {
      setLoading(true);
      setError('');

      const gameId = localStorage.getItem('current_game_id');
      const playerStr = localStorage.getItem('battleship_player');

      console.log('[PlaceShips] Placement aléatoire - gameId:', gameId);
      console.log('[PlaceShips] Player:', playerStr);

      if (!gameId) {
        throw new Error('ID de partie manquant. Veuillez recommencer.');
      }

      if (!playerStr) {
        throw new Error('Joueur non trouvé. Veuillez recommencer.');
      }

      const player = JSON.parse(playerStr);

      // Réinitialiser d'abord si des navires sont déjà placés
      if (placedShips.length > 0) {
        console.log('[PlaceShips] Réinitialisation de la grille');
        const emptyGrid = {};
        for (let row of ROWS) {
          for (let col of COLS) {
            emptyGrid[`${row}${col}`] = 'EMPTY';
          }
        }
        setGridData(emptyGrid);
        setPlacedShips([]);
        setCurrentShipIndex(0);
      }

      // Appeler l'API pour le placement aléatoire
      console.log('[PlaceShips] Appel API placement aléatoire...');
      const response = await placeShipsRandom(gameId, player.id);
      console.log('[PlaceShips] Réponse API:', response);

      // La fonction placeShipsRandom retourne déjà response.data
      if (response && response.message) {
        // Succès - naviguer vers la page de jeu
        console.log('[PlaceShips] Navigation vers page de jeu');
        navigate(`/game/${gameId}`);
      } else {
        throw new Error('Réponse invalide du serveur');
      }
    } catch (err) {
      console.error('[PlaceShips] Erreur placement aléatoire:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Erreur lors du placement aléatoire';
      setError(errorMsg);
      setLoading(false);
    }
  };

  // Valider et envoyer les navires
  const handleSubmit = async () => {
    if (placedShips.length !== SHIPS_TO_PLACE.length) {
      setError('Vous devez placer tous les navires');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const gameId = localStorage.getItem('current_game_id');
      const player = JSON.parse(localStorage.getItem('battleship_player'));

      await placeShips(gameId, player.id, placedShips);

      // Rediriger vers le jeu
      navigate(`/game/${gameId}`);
    } catch (err) {
      console.error('Erreur placement navires:', err);
      setError(err.response?.data?.error || 'Erreur lors du placement');
      setLoading(false);
    }
  };

  // Réinitialiser
  const handleReset = () => {
    const emptyGrid = {};
    ROWS.forEach(row => {
      COLS.forEach(col => {
        emptyGrid[`${row}${col}`] = 'EMPTY';
      });
    });
    setGridData(emptyGrid);
    setPlacedShips([]);
    setCurrentShipIndex(0);
    setHoveredCells([]);
    setCanPlace(false);
  };

  const currentShip = currentShipIndex < SHIPS_TO_PLACE.length
    ? SHIPS_TO_PLACE[currentShipIndex]
    : null;

  const allShipsPlaced = placedShips.length === SHIPS_TO_PLACE.length;

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

      {/* Grille verte */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(34, 197, 94, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.4) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/game-mode')}
            className="flex items-center space-x-2 text-white hover:text-green-400 transition-colors"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{color: '#22c55e'}}>
            Placez vos navires
          </h1>
          <p className="text-gray-300">
            {allShipsPlaced
              ? 'Tous les navires sont placés! Cliquez sur "Commencer" pour démarrer.'
              : `Navire à placer: ${currentShip?.name} (${currentShip?.size} cases) ${currentShip?.emoji}`
            }
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mb-6 bg-red-900 bg-opacity-80 border-2 border-red-500 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Grille */}
          <div className="lg:col-span-2 bg-black bg-opacity-80 border-4 p-6 rounded-xl shadow-2xl" style={{borderColor: '#22c55e'}}>
            <div onMouseLeave={() => setHoveredCells([])}>
              <Grid
                gridData={gridData}
                isOwn={true}
                onCellClick={handleCellClick}
                title="Votre grille"
                highlightedCells={[]}
                onCellHover={handleMouseEnter}
                canPlaceShip={canPlace}
                ships={placedShips}
                previewShip={getPreviewShip()}
              />
            </div>
          </div>

          {/* Panneau de contrôle */}
          <div className="space-y-4">
            {/* Panneau VOTRE FLOTTE */}
            <FleetPanel
              placedShips={placedShips}
              currentShipIndex={currentShipIndex}
            />

            {/* Contrôles */}
            {!allShipsPlaced && (
              <div className="bg-black bg-opacity-80 border-2 p-4 rounded-lg shadow-lg" style={{borderColor: '#22c55e'}}>
                <button
                  onClick={toggleOrientation}
                  className="w-full text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors hover:bg-opacity-90"
                  style={{backgroundColor: '#22c55e'}}
                  data-testid="rotate-btn"
                >
                  <RotateCw className="w-5 h-5" />
                  <span>Rotation ({orientation === ORIENTATIONS.HORIZONTAL ? 'Horizontal' : 'Vertical'})</span>
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="bg-black bg-opacity-80 border-2 p-4 rounded-lg shadow-lg space-y-3" style={{borderColor: '#22c55e'}}>
              <button
                onClick={handleRandomPlacement}
                disabled={loading || allShipsPlaced}
                className="w-full bg-yellow-700 hover:bg-yellow-800 text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 transition-colors border-2 border-yellow-500"
                data-testid="random-btn"
              >
                <Shuffle className="w-5 h-5" />
                <span>Placement aléatoire</span>
              </button>

              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 border-2 border-gray-500"
              >
                Réinitialiser
              </button>

              {allShipsPlaced && (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 animate-pulse transition-colors hover:bg-opacity-90 border-2"
                  style={{backgroundColor: '#22c55e', borderColor: '#16a34a'}}
                  data-testid="start-game-btn"
                >
                  <Send className="w-5 h-5" />
                  <span>Commencer la partie</span>
                </button>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-black bg-opacity-80 border-2 p-4 rounded-lg text-sm" style={{borderColor: '#22c55e'}}>
              <h4 className="font-bold mb-2" style={{color: '#22c55e'}}>Instructions:</h4>
              <ul className="space-y-1 text-xs text-gray-300">
                <li>• Cliquez sur une case pour placer un navire</li>
                <li>• Utilisez le bouton Rotation pour changer l'orientation</li>
                <li>• Les navires ne peuvent pas se chevaucher</li>
                <li>• Ou utilisez le placement aléatoire</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceShips;
