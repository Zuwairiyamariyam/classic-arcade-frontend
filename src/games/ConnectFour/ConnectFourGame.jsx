import React, { useState, useEffect } from "react";
import "./ConnectFourGame.css";
import {
  playTileSlideSound,
  playWinSound,
  playLoseSound,
} from "../../utils/soundFX";

const ROWS = 6;
const COLS = 7;

const createEmptyBoard = () =>
  Array(ROWS)
    .fill(null)
    .map(() => Array(COLS).fill(0));

export default function ConnectFourGame() {
  const [mode, setMode] = useState(null); // null | 'VS_BOT' | 'PASS_PLAY'
  const [userColor, setUserColor] = useState(null); // null | 1 (Red) | 2 (Yellow)
  
  // Custom Player Names state
  const [p1Name, setP1Name] = useState("");
  const [p2Name, setP2Name] = useState("");
  const [isNamesReady, setIsNamesReady] = useState(false);

  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState(1); // 1 = Red, 2 = Yellow
  const [winner, setWinner] = useState(null); // null | 1 | 2 | 'DRAW'
  const [winningCells, setWinningCells] = useState([]);
  const [isBotThinking, setIsBotThinking] = useState(false);

  // Default fallback names
  const playerOneTitle = p1Name.trim() ? p1Name.trim() : "Player 1";
  const playerTwoTitle = p2Name.trim() ? p2Name.trim() : "Player 2";

  // Check 4-in-a-row winner helper
  const checkWinAt = (grid, r, c, player) => {
    const directions = [
      [0, 1],  // Horizontal
      [1, 0],  // Vertical
      [1, 1],  // Diagonal \
      [1, -1], // Diagonal /
    ];

    for (let [dr, dc] of directions) {
      let matched = [[r, c]];

      for (let step = 1; step < 4; step++) {
        let nr = r + dr * step;
        let nc = c + dc * step;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc] === player) {
          matched.push([nr, nc]);
        } else {
          break;
        }
      }

      for (let step = 1; step < 4; step++) {
        let nr = r - dr * step;
        let nc = c - dc * step;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc] === player) {
          matched.push([nr, nc]);
        } else {
          break;
        }
      }

      if (matched.length >= 4) {
        return matched;
      }
    }
    return null;
  };

  const checkDraw = (grid) => {
    return grid[0].every((cell) => cell !== 0);
  };

  const getLowestEmptyRow = (grid, col) => {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (grid[r][col] === 0) return r;
    }
    return -1;
  };

  const dropDisc = (colIndex) => {
    if (winner || isBotThinking) return;

    const targetRow = getLowestEmptyRow(board, colIndex);
    if (targetRow === -1) return;

    playTileSlideSound();

    const newBoard = board.map((row) => [...row]);
    newBoard[targetRow][colIndex] = currentPlayer;
    setBoard(newBoard);

    const winningStreak = checkWinAt(newBoard, targetRow, colIndex, currentPlayer);
    if (winningStreak) {
      setWinner(currentPlayer);
      setWinningCells(winningStreak);
      if (mode === "VS_BOT" && currentPlayer !== userColor) {
        playLoseSound();
      } else {
        playWinSound();
      }
      return;
    }

    if (checkDraw(newBoard)) {
      setWinner("DRAW");
      return;
    }

    setCurrentPlayer((prev) => (prev === 1 ? 2 : 1));
  };

  // Competitive Bot Logic
  useEffect(() => {
    const botColor = userColor === 1 ? 2 : 1;

    if (mode === "VS_BOT" && currentPlayer === botColor && !winner) {
      setIsBotThinking(true);

      const botTimer = setTimeout(() => {
        let bestCol = -1;
        const availableCols = [];
        for (let c = 0; c < COLS; c++) {
          if (board[0][c] === 0) availableCols.push(c);
        }

        // 1. Strict Win Check
        for (let c of availableCols) {
          const r = getLowestEmptyRow(board, c);
          const testBoard = board.map((row) => [...row]);
          testBoard[r][c] = botColor;
          if (checkWinAt(testBoard, r, c, botColor)) {
            bestCol = c;
            break;
          }
        }

        // 2. Strict Block
        if (bestCol === -1) {
          for (let c of availableCols) {
            const r = getLowestEmptyRow(board, c);
            const testBoard = board.map((row) => [...row]);
            testBoard[r][c] = userColor;
            if (checkWinAt(testBoard, r, c, userColor)) {
              bestCol = c;
              break;
            }
          }
        }

        // 3. Look-Ahead Safe Check
        const safeCols = availableCols.filter((c) => {
          const r = getLowestEmptyRow(board, c);
          if (r > 0) {
            const testBoard = board.map((row) => [...row]);
            testBoard[r][c] = botColor;
            testBoard[r - 1][c] = userColor;
            if (checkWinAt(testBoard, r - 1, c, userColor)) {
              return false;
            }
          }
          return true;
        });

        // 4. Center Priority
        if (bestCol === -1) {
          const candidateCols = safeCols.length > 0 ? safeCols : availableCols;
          const centerPriority = [3, 2, 4, 1, 5, 0, 6];

          for (let c of centerPriority) {
            if (candidateCols.includes(c)) {
              bestCol = c;
              break;
            }
          }
        }

        setIsBotThinking(false);
        if (bestCol !== -1 && bestCol !== undefined) {
          dropDisc(bestCol);
        }
      }, 650);

      return () => clearTimeout(botTimer);
    }
  }, [currentPlayer, mode, board, winner, userColor]);

  const restartGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(1);
    setWinner(null);
    setWinningCells([]);
    setIsBotThinking(false);
  };

  // Exit & Complete Reset
  const handleExitToMode = () => {
    setMode(null);
    setUserColor(null);
    setIsNamesReady(false);
    setP1Name("");
    setP2Name("");
    setWinner(null);
  };

  const handleModeSelect = (selectedMode) => {
    setMode(selectedMode);
    setUserColor(null);
    setIsNamesReady(false);
    setP1Name("");
    setP2Name("");
  };

  const handleColorSelect = (chosenColor) => {
    setUserColor(chosenColor);
    restartGame();
  };

  const handleStartPassAndPlay = () => {
    setUserColor(1);
    setIsNamesReady(true);
    restartGame();
  };

  const isWinningCell = (r, c) => {
    return winningCells.some(([wr, wc]) => wr === r && wc === c);
  };

  // Turn status label
  const getTurnStatusText = () => {
    if (winner) return "Match Ended";
    if (mode === "VS_BOT") {
      if (currentPlayer === userColor) return "Your Turn";
      return isBotThinking ? "Computer Thinking" : "Computer's Turn";
    }
    return currentPlayer === 1
      ? `${playerOneTitle}'s Turn`
      : `${playerTwoTitle}'s Turn`;
  };

  // SCREEN 1: MODE SELECTION
  if (!mode) {
    return (
      <div className="c4-viewport">
        <div className="c4-mode-card">
          <div className="c4-title-box">
            <div className="c4-grid-emblem">
              {Array.from({ length: 16 }).map((_, index) => {
                const row = Math.floor(index / 4);
                const col = index % 4;
                const isConnected = row + col === 3;
                return (
                  <span
                    key={index}
                    className={`c4-grid-disc ${isConnected ? "disc-connected" : "disc-dim"}`}
                  />
                );
              })}
            </div>
            <h1 className="c4-main-title">CONNECT FOUR</h1>
          </div>

          <div className="c4-mode-options">
            <button
              className="c4-mode-pill-btn btn-pink"
              onClick={() => handleModeSelect("VS_BOT")}
            >
              SINGLE PLAYER
            </button>
            <button
              className="c4-mode-pill-btn btn-dark"
              onClick={() => handleModeSelect("PASS_PLAY")}
            >
              WITH A FRIEND
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 1.5A: COMPUTER MODE COLOR PICKER
  if (mode === "VS_BOT" && !userColor) {
    return (
      <div className="c4-viewport">
        <div className="c4-mode-card">
          <div className="c4-title-box">
            <span className="c4-sub-badge">PLAYER SETUP</span>
            <h1 className="c4-main-title">CHOOSE YOUR COLOR</h1>
            <p className="c4-pick-subtitle">Select the disc you want to command</p>
          </div>

          <div className="c4-color-picker-grid">
            <button
              className="color-choice-card choice-red"
              onClick={() => handleColorSelect(1)}
            >
              <div className="c4-choice-disc red-3d-disc" />
              <strong className="choice-title">RED DISC</strong>
              <span className="choice-turn-tag">First Turn</span>
            </button>

            <button
              className="color-choice-card choice-yellow"
              onClick={() => handleColorSelect(2)}
            >
              <div className="c4-choice-disc yellow-3d-disc" />
              <strong className="choice-title">YELLOW DISC</strong>
              <span className="choice-turn-tag">Second Turn</span>
            </button>
          </div>

          <button className="c4-back-link-btn" onClick={handleExitToMode}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 1.5B: PASS & PLAY PLAYER NAMES SETUP (ONLY PLACEHOLDERS)
  if (mode === "PASS_PLAY" && !isNamesReady) {
    return (
      <div className="c4-viewport">
        <div className="c4-mode-card">
          <div className="c4-title-box">
            <span className="c4-sub-badge">2-PLAYER SETUP</span>
            <h1 className="c4-main-title">ENTER NAMES</h1>
          </div>

          <div className="c4-names-form">
            {/* Player 1 Row */}
            <div className="c4-name-input-row">
              <span className="c4-input-disc-indicator red-3d-disc" />
              <input
                type="text"
                maxLength={12}
                value={p1Name}
                onChange={(e) => setP1Name(e.target.value)}
                placeholder="Player 1"
                className="c4-name-input"
              />
            </div>

            {/* Player 2 Row */}
            <div className="c4-name-input-row">
              <span className="c4-input-disc-indicator yellow-3d-disc" />
              <input
                type="text"
                maxLength={12}
                value={p2Name}
                onChange={(e) => setP2Name(e.target.value)}
                placeholder="Player 2"
                className="c4-name-input"
              />
            </div>

            <button
              className="c4-mode-pill-btn btn-pink"
              onClick={handleStartPassAndPlay}
            >
              START GAME
            </button>
          </div>

          <button className="c4-back-link-btn" onClick={handleExitToMode}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 2: GAMEPLAY ARENA
  return (
    <div className="c4-viewport">
      <div className="c4-game-container">
        <div className="c4-top-bar">
          <span className="c4-mode-tag">
            {mode === "VS_BOT" ? "🤖 VS COMPUTER" : "🤜🤛 PASS & PLAY"}
          </span>

          <div className="c4-turn-pill">
            <span
              className={`turn-indicator-disc ${
                currentPlayer === 1 ? "disc-red" : "disc-yellow"
              }`}
            ></span>
            <strong>{getTurnStatusText()}</strong>
          </div>
        </div>

        <div className="c4-board-stand">
          <div className="c4-col-drop-bar">
            {Array(COLS)
              .fill(null)
              .map((_, colIdx) => (
                <button
                  key={colIdx}
                  className="c4-drop-btn"
                  onClick={() => dropDisc(colIdx)}
                  disabled={
                    Boolean(winner) ||
                    board[0][colIdx] !== 0 ||
                    (mode === "VS_BOT" && currentPlayer !== userColor)
                  }
                  title={`Drop in Column ${colIdx + 1}`}
                >
                  ↓
                </button>
              ))}
          </div>

          <div className="c4-grid">
            {board.map((row, rIdx) =>
              row.map((cell, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className="c4-cell-hole"
                  onClick={() => dropDisc(cIdx)}
                >
                  <div
                    className={`c4-disc ${
                      cell === 1
                        ? "disc-red"
                        : cell === 2
                        ? "disc-yellow"
                        : "disc-empty"
                    } ${isWinningCell(rIdx, cIdx) ? "disc-win-glow" : ""}`}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* BOTTOM CONTROLS */}
        <div className="c4-bottom-controls">
          <button className="c4-pill-btn" onClick={restartGame}>
            ↺ Restart
          </button>
          <button className="c4-pill-btn" onClick={handleExitToMode}>
            ← Mode
          </button>
        </div>
      </div>

      {/* VICTORY MODAL */}
      {winner && (
        <div className="c4-modal-overlay">
          <div className="c4-victory-card">
            <div className="c4-victory-badge-wrap">
              <span className="c4-victory-badge">
                {winner === "DRAW" ? "🤝 TIE MATCH" : "🏆 CHAMPION!"}
              </span>
            </div>

            <div className="c4-victory-hero-icon">
              {winner === "DRAW"
                ? "⚖️"
                : mode === "VS_BOT"
                ? winner === userColor
                  ? "🎉"
                  : "🤖"
                : "🎉"}
            </div>

            <h2 className="c4-victory-title">
              {winner === "DRAW"
                ? "It's a Draw!"
                : mode === "VS_BOT"
                ? winner === userColor
                  ? "Victory! You Won!"
                  : "Computer Won!"
                : winner === 1
                ? `${playerOneTitle} Won!`
                : `${playerTwoTitle} Won!`}
            </h2>

            <p className="c4-victory-desc">
              {winner === "DRAW"
                ? "Both played fiercely. The board is completely full!"
                : "Successfully lined up 4 discs in a row!"}
            </p>

            <div className="c4-victory-actions">
              <button className="c4-modal-btn btn-primary" onClick={restartGame}>
                ↺ Play Again
              </button>
              <button
                className="c4-modal-btn btn-secondary"
                onClick={handleExitToMode}
              >
                ← Mode Select
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}