// ArcadeDashboard.jsx
import React, { useState } from "react";
import "./ArcadeDashboard.css";

import LudoGame from "./games/Ludo/LudoGame";
import RPSGame from "./games/RPS/RPSGame";
import SlidingPuzzleGame from "./games/SlidingPuzzle/SlidingPuzzleGame";
import TicTacToeGame from "./games/TicTacToe/TicTacToeGame";
import ConnectFourGame from "./games/ConnectFour/ConnectFourGame";

// Recommended Order: Quick Picks ➔ Strategy & Board Anchor
const GAMES = [
  {
    id: "tictactoe",
    title: "Tic Tac Toe",
    icon: "❌",
  },
  {
    id: "connect4",
    title: "Connect Four",
    icon: "🔴",
  },
  {
    id: "rps",
    title: "Rock Paper Scissors",
    icon: "✂️",
  },
  {
    id: "puzzle",
    title: "Sliding Puzzle",
    icon: "🧩",
  },
  {
    id: "ludo",
    title: "Classic Ludo",
    icon: "🎲",
  },
];

export default function ArcadeDashboard() {
  const [activeGame, setActiveGame] = useState(null);

  const renderActiveGame = () => {
    switch (activeGame) {
      case "tictactoe":
        return <TicTacToeGame />;
      case "connect4":
        return <ConnectFourGame />;
      case "rps":
        return <RPSGame />;
      case "puzzle":
        return <SlidingPuzzleGame />;
      case "ludo":
        return <LudoGame />;
      default:
        return null;
    }
  };

  return (
    <div className="arcade-viewport">
      <div className="arcade-ambient-glow glow-top"></div>
      <div className="arcade-ambient-glow glow-bottom"></div>

      <header className="arcade-header">
        <h1 className="arcade-title">
          Welcome to <span className="title-highlight">Classic Arcade Games</span>
        </h1>
      </header>

      <main className="arcade-horizontal-list">
        {GAMES.map((game) => (
          <div
            key={game.id}
            className="arcade-horizontal-card"
            onClick={() => setActiveGame(game.id)}
          >
            <div className="card-left-group">
              <span className="game-logo-badge">{game.icon}</span>
              <h3 className="game-heading">{game.title}</h3>
            </div>
            <div className="card-right-group">
              <span className="play-btn-pill">Play Now ➔</span>
            </div>
          </div>
        ))}
      </main>

      <footer className="arcade-footer">
        Developed by Zuwairiya Mariyam
      </footer>

      {activeGame && (
        <div className="game-modal-overlay">
          <div className="game-modal-header">
            <button
              className="modal-close-btn"
              onClick={() => setActiveGame(null)}
              title="Close and return to Arcade"
            >
              ✕ Back to Home
            </button>
            <span className="modal-game-name">
              🕹️ Playing: {GAMES.find((g) => g.id === activeGame)?.title}
            </span>
          </div>
          <div className="game-modal-content">{renderActiveGame()}</div>
        </div>
      )}
    </div>
  );
}