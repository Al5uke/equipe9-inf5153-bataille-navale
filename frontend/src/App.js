import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@/App.css';

// Pages
import Home from './pages/Home';
import GameMode from './pages/GameMode';
import PlaceShips from './pages/PlaceShips';
import Game from './pages/Game';
import Matchmaking from './pages/Matchmaking';
import Leaderboard from './pages/Leaderboard';
import Spectator from './pages/Spectator';
import Admin from './pages/Admin';

// Composant pour rediriger /game vers /game/:gameId
const GameRedirect = () => {
  const gameId = localStorage.getItem('current_game_id');
  if (gameId) {
    return <Navigate to={`/game/${gameId}`} replace />;
  }
  return <Navigate to="/game-mode" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game-mode" element={<GameMode />} />
        <Route path="/matchmaking" element={<Matchmaking />} />
        <Route path="/place-ships" element={<PlaceShips />} />
        <Route path="/game" element={<GameRedirect />} />
        <Route path="/game/:gameId" element={<Game />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/spectator" element={<Spectator />} />
        <Route path="/spectator/:gameId" element={<Spectator />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
