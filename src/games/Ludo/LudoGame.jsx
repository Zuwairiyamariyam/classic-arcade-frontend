import React, { useCallback, useEffect, useRef, useState } from "react";
import "./LudoGame.css";

const API_URL = "https://classic-arcade-backend.onrender.com/api/ludo";

const PLAYER_ORDER = ["red", "green", "yellow", "blue"];

const PLAYER_THEME = {
  red: { name: "Red", label: "PLAYER_1", color: "#e53935" },
  green: { name: "Green", label: "PLAYER_2", color: "#43a047" },
  yellow: { name: "Yellow", label: "PLAYER_3", color: "#fbc02d" },
  blue: { name: "Blue", label: "PLAYER_4", color: "#1e88e5" },
};

// 52 Common Track Coordinates [row, col] on 15x15 grid
const TRACK_COORDINATES = [
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  [0, 7], [0, 8],
  [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  [7, 14], [8, 14],
  [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  [14, 7], [14, 6],
  [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  [7, 0], [6, 0]
];

const HOME_LANES = {
  red: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
  green: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
  yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],
  blue: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]],
};

const START_INDEX = { red: 0, green: 13, yellow: 26, blue: 39 };

const RANK_DATA = {
  1: { label: "1st", status: "WIN", badgeClass: "status-win", icon: "🥇" },
  2: { label: "2nd", status: "WIN", badgeClass: "status-win", icon: "🥈" },
  3: { label: "3rd", status: "WIN", badgeClass: "status-win", icon: "🥉" },
  4: { label: "4th", status: "LOSE", badgeClass: "status-lose", icon: "💔" },
};

// Character Standing Pawn
const PawnCharacter = ({ color, isMovable, onClick, isHomeReached = false }) => {
  return (
    <div
      className={`pawn-character pawn-${color} ${isMovable ? "pawn-movable" : ""} ${isHomeReached ? "pawn-home-star" : ""}`}
      onClick={isMovable ? onClick : undefined}
    >
      <div className="pawn-hat"></div>
      <div className="pawn-face">
        <span className="pawn-eye eye-left"></span>
        <span className="pawn-eye eye-right"></span>
        <span className="pawn-smile"></span>
      </div>
      <div className="pawn-collar"></div>
      <div className="pawn-robe"></div>
      <div className="pawn-shadow"></div>
    </div>
  );
};

export default function LudoGame() {
  const [setupDone, setSetupDone] = useState(false);
  const [playerNames, setPlayerNames] = useState({
    red: "",
    green: "",
    yellow: "",
    blue: "",
  });

  const [gameState, setGameState] = useState(null);
  const [displayTokens, setDisplayTokens] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [rollingDisplayNum, setRollingDisplayNum] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const rollIntervalRef = useRef(null);

  const requestBackend = useCallback(async (endpoint, options = {}) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Backend request failed.");
    }
    return data;
  }, []);

  const startGame = async () => {
    try {
      setLoading(true);
      setError("");

      const finalNames = {
        red: playerNames.red.trim() || "Player 1",
        green: playerNames.green.trim() || "Player 2",
        yellow: playerNames.yellow.trim() || "Player 3",
        blue: playerNames.blue.trim() || "Player 4",
      };

      const data = await requestBackend("/start", {
        method: "POST",
        body: JSON.stringify({ playerNames: finalNames }),
      });
      setGameState(data);
      setDisplayTokens(data.tokens);
      setSetupDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const rollDice = async () => {
    if (isRolling || isMoving || loading || gameState?.hasRolled || gameState?.gameOver) return;
    try {
      setIsRolling(true);
      setError("");

      rollIntervalRef.current = setInterval(() => {
        setRollingDisplayNum(Math.floor(Math.random() * 6) + 1);
      }, 70);

      const data = await requestBackend("/roll", { method: "POST" });

      setTimeout(() => {
        clearInterval(rollIntervalRef.current);
        setGameState(data);
        setIsRolling(false);
      }, 450);
    } catch (err) {
      clearInterval(rollIntervalRef.current);
      setError(err.message);
      setIsRolling(false);
    }
  };

  // Step-by-step box hopping animation
  const animateStepByStep = (color, tokenId, fromPos, toPos, onFinish) => {
    if (fromPos === -1) {
      setDisplayTokens((prev) => {
        const copy = JSON.parse(JSON.stringify(prev));
        copy[color][tokenId] = 0;
        return copy;
      });
      onFinish();
      return;
    }

    let current = fromPos;
    const interval = setInterval(() => {
      current++;
      setDisplayTokens((prev) => {
        const copy = JSON.parse(JSON.stringify(prev));
        copy[color][tokenId] = current;
        return copy;
      });

      if (current >= toPos) {
        clearInterval(interval);
        setTimeout(onFinish, 60);
      }
    }, 120);
  };

  const handleTokenClick = async (color, tokenId) => {
    if (!gameState?.hasRolled || gameState?.gameOver || color !== gameState?.activePlayer || isMoving) return;
    try {
      setIsMoving(true);
      setError("");

      const fromPos = gameState.tokens[color][tokenId];
      const data = await requestBackend("/move", {
        method: "POST",
        body: JSON.stringify({ color, tokenId }),
      });

      const toPos = data.tokens[color][tokenId];

      animateStepByStep(color, tokenId, fromPos, toPos, () => {
        setDisplayTokens(data.tokens);
        setGameState(data);
        setIsMoving(false);
      });
    } catch (err) {
      setError(err.message);
      setIsMoving(false);
    }
  };

  const tokens = displayTokens || gameState?.tokens || {
    red: [-1, -1, -1, -1],
    green: [-1, -1, -1, -1],
    yellow: [-1, -1, -1, -1],
    blue: [-1, -1, -1, -1],
  };

  const activePlayer = gameState?.activePlayer;
  const diceNumber = gameState?.diceNumber;
  const hasRolled = gameState?.hasRolled;
  const placements = gameState?.placements || {};

  const isTokenMovable = useCallback((color, tokenId) => {
    if (color !== activePlayer || !hasRolled || gameState?.gameOver || isMoving) return false;
    const pos = tokens[color]?.[tokenId];
    if (pos === -1) return diceNumber === 6;
    if (pos === 56) return false;
    return pos + diceNumber <= 56;
  }, [activePlayer, hasRolled, gameState?.gameOver, isMoving, tokens, diceNumber]);

  // Auto-move single coin
  useEffect(() => {
    if (!hasRolled || !activePlayer || isRolling || isMoving || gameState?.gameOver) return;

    const movableTokenIds = [];
    tokens[activePlayer]?.forEach((_, id) => {
      if (isTokenMovable(activePlayer, id)) {
        movableTokenIds.push(id);
      }
    });

    if (movableTokenIds.length === 1) {
      const timer = setTimeout(() => {
        handleTokenClick(activePlayer, movableTokenIds[0]);
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [hasRolled, activePlayer, isRolling, isMoving, gameState?.gameOver, isTokenMovable, tokens]);

  const restartGame = async () => {
    try {
      setLoading(true);
      const data = await requestBackend("/reset", { method: "POST" });
      setGameState(data);
      setDisplayTokens(data.tokens);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exitGame = () => {
    setPlayerNames({ red: "", green: "", yellow: "", blue: "" });
    setGameState(null);
    setDisplayTokens(null);
    setError("");
    setIsMoving(false);
    setIsRolling(false);
    setSetupDone(false);
  };

  const getTokenCoordinate = (color, pos) => {
    if (pos === -1 || pos === 56) return null;
    if (pos >= 0 && pos <= 50) {
      const idx = (START_INDEX[color] + pos) % 52;
      return TRACK_COORDINATES[idx];
    }
    if (pos >= 51 && pos <= 55) {
      return HOME_LANES[color][pos - 51];
    }
    return null;
  };

  // Friend's Reference concept: Linear line row along the triangle base
  const renderHomeFinishedTokens = (color) => {
    const finishedCoins = [];
    tokens[color]?.forEach((pos, tokenId) => {
      if (pos === 56) {
        finishedCoins.push(tokenId);
      }
    });

    if (finishedCoins.length === 0) return null;

    return (
      <div className={`home-line-tray tray-line-${color}`}>
        {finishedCoins.map((tokenId) => (
          <div key={`finished-${color}-${tokenId}`} className="home-line-pawn-wrapper">
            <PawnCharacter color={color} isHomeReached={true} />
          </div>
        ))}
      </div>
    );
  };

  const renderPlayerProfile = (color, positionClass) => {
    const isTurn = activePlayer === color && !gameState?.gameOver;
    const name = gameState?.playerNames?.[color] || playerNames[color] || PLAYER_THEME[color].name;
    const rank = placements[color];

    return (
      <div className={`island-profile-card ${positionClass} ${isTurn ? "profile-turn-active" : ""}`}>
        <div className="profile-inner-top">
          <div className="profile-avatar-circle">
            <span className="profile-head-icon">👤</span>
          </div>

          {rank ? (
            <div className={`profile-rank-badge rank-tier-${rank}`}>
              <span className="rank-emoji">{RANK_DATA[rank]?.icon}</span>
              <span className="rank-text">{RANK_DATA[rank]?.label}</span>
            </div>
          ) : (
            <div
              className={`island-dice-holder ${isTurn && !hasRolled ? "dice-interactive" : ""} ${
                isRolling && isTurn ? "dice-rolling-3d" : ""
              }`}
              onClick={isTurn && !hasRolled ? rollDice : undefined}
              title={isTurn && !hasRolled ? "Click to roll dice" : ""}
            >
              {isRolling && isTurn ? (
                <span className="dice-digit-rolling">{rollingDisplayNum}</span>
              ) : isTurn && diceNumber ? (
                <span className="dice-digit">{diceNumber}</span>
              ) : isTurn ? (
                <span className="dice-icon">🎲</span>
              ) : (
                <span className="dice-placeholder">●</span>
              )}
            </div>
          )}
        </div>
        <div className="profile-bottom-tag" style={{ backgroundColor: PLAYER_THEME[color].color }}>
          {name.toUpperCase()}
        </div>
      </div>
    );
  };

  const renderCellTokens = (row, col) => {
    const cellTokens = [];
    PLAYER_ORDER.forEach((color) => {
      tokens[color]?.forEach((pos, tokenId) => {
        const coord = getTokenCoordinate(color, pos);
        if (coord && coord[0] === row && coord[1] === col) {
          cellTokens.push({ color, tokenId });
        }
      });
    });

    if (cellTokens.length === 0) return null;

    return (
      <div className={`cell-token-overlay count-${cellTokens.length}`}>
        {cellTokens.map(({ color, tokenId }) => {
          const movable = isTokenMovable(color, tokenId);
          return (
            <PawnCharacter
              key={`${color}-${tokenId}`}
              color={color}
              isMovable={movable}
              onClick={() => movable && handleTokenClick(color, tokenId)}
            />
          );
        })}
      </div>
    );
  };

  // Rank Leaderboard Builder (1st, 2nd, 3rd, 4th)
  const getRankedPlayerList = () => {
    const list = [];
    PLAYER_ORDER.forEach((color) => {
      const r = placements[color] || 4;
      list.push({
        color,
        name: gameState?.playerNames?.[color] || PLAYER_THEME[color].name,
        rank: r,
      });
    });
    return list.sort((a, b) => a.rank - b.rank);
  };

  // =========================
  // SCREEN 1: SETUP MODAL
  // =========================
  if (!setupDone) {
    return (
      <div className="water-world-viewport">
        <div className="ocean-wave-layer wave-1"></div>
        <div className="ocean-wave-layer wave-2"></div>
        <div className="ocean-caustic-glow"></div>

        <div className="island-setup-modal">
          <div className="island-header-badge">
            <span className="badge-icon">🐬</span>
            <h2>CLASSIC LUDO</h2>
          </div>
          <p className="setup-sub">Enter player names for 4-Player Battle</p>

          <div className="setup-fields-grid">
            {PLAYER_ORDER.map((color, index) => (
              <div key={color} className={`setup-field-box setup-${color}`}>
                <label>
                  <span className="color-dot"></span>
                  {PLAYER_THEME[color].name} Player
                </label>
                <input
                  type="text"
                  maxLength={14}
                  placeholder={`Player ${index + 1}`}
                  value={playerNames[color]}
                  onChange={(e) =>
                    setPlayerNames({ ...playerNames, [color]: e.target.value })
                  }
                />
              </div>
            ))}
          </div>

          {error && <div className="setup-error-msg">⚠️ {error}</div>}

          <button className="setup-start-btn" onClick={startGame} disabled={loading}>
            {loading ? "Starting..." : "PLAY NOW"}
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // SCREEN 2: GAMEPLAY ARENA
  // =========================
  return (
    <div className="water-world-viewport">
      <div className="ocean-wave-layer wave-1"></div>
      <div className="ocean-wave-layer wave-2"></div>
      <div className="ocean-caustic-glow"></div>

      {/* Top Players Row */}
      <div className="profiles-horizontal-bar">
        {renderPlayerProfile("red", "corner-red")}
        {renderPlayerProfile("green", "corner-green")}
      </div>

      {/* Main Island Board Structure */}
      <div className="island-ludo-board">
        {/* 4 Stone Islands in the corners */}
        <div className="stone-island island-red">
          <div className="stone-surface">
            {tokens.red.map((pos, id) => (
              <div key={id} className="rock-socket socket-red">
                {pos === -1 && (
                  <PawnCharacter
                    color="red"
                    isMovable={isTokenMovable("red", id)}
                    onClick={() => isTokenMovable("red", id) && handleTokenClick("red", id)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="stone-island island-green">
          <div className="stone-surface">
            {tokens.green.map((pos, id) => (
              <div key={id} className="rock-socket socket-green">
                {pos === -1 && (
                  <PawnCharacter
                    color="green"
                    isMovable={isTokenMovable("green", id)}
                    onClick={() => isTokenMovable("green", id) && handleTokenClick("green", id)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="stone-island island-blue">
          <div className="stone-surface">
            {tokens.blue.map((pos, id) => (
              <div key={id} className="rock-socket socket-blue">
                {pos === -1 && (
                  <PawnCharacter
                    color="blue"
                    isMovable={isTokenMovable("blue", id)}
                    onClick={() => isTokenMovable("blue", id) && handleTokenClick("blue", id)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="stone-island island-yellow">
          <div className="stone-surface">
            {tokens.yellow.map((pos, id) => (
              <div key={id} className="rock-socket socket-yellow">
                {pos === -1 && (
                  <PawnCharacter
                    color="yellow"
                    isMovable={isTokenMovable("yellow", id)}
                    onClick={() => isTokenMovable("yellow", id) && handleTokenClick("yellow", id)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Center Triangular Victory Island with Friend's Cascade Line Rows */}
        <div className="center-cross-goal">
          <div className="tri-zone zone-red"></div>
          <div className="tri-zone zone-green"></div>
          <div className="tri-zone zone-yellow"></div>
          <div className="tri-zone zone-blue"></div>

          {/* Clean line arrays per triangle */}
          {renderHomeFinishedTokens("red")}
          {renderHomeFinishedTokens("green")}
          {renderHomeFinishedTokens("yellow")}
          {renderHomeFinishedTokens("blue")}
        </div>

        {/* 15x15 Matrix Track Cells */}
        <div className="strict-matrix-grid">
          {Array.from({ length: 15 }).map((_, r) =>
            Array.from({ length: 15 }).map((_, c) => {
              const isYard = (r < 6 && c < 6) || (r < 6 && c > 8) || (r > 8 && c < 6) || (r > 8 && c > 8);
              const isCenter = r >= 6 && r <= 8 && c >= 6 && c <= 8;
              if (isYard || isCenter) return null;

              const isStar =
                (r === 6 && c === 1) || (r === 2 && c === 6) ||
                (r === 1 && c === 8) || (r === 6 && c === 12) ||
                (r === 8 && c === 13) || (r === 12 && c === 8) ||
                (r === 13 && c === 6) || (r === 8 && c === 2);

              const isRedHomeLane = r === 7 && c >= 1 && c <= 5;
              const isGreenHomeLane = c === 7 && r >= 1 && r <= 5;
              const isYellowHomeLane = r === 7 && c >= 9 && c <= 13;
              const isBlueHomeLane = c === 7 && r >= 9 && r <= 13;

              let customClass = "";
              if (isRedHomeLane) customClass = "lane-red";
              else if (isGreenHomeLane) customClass = "lane-green";
              else if (isYellowHomeLane) customClass = "lane-yellow";
              else if (isBlueHomeLane) customClass = "lane-blue";

              return (
                <div
                  key={`${r}-${c}`}
                  className={`matrix-tile ${customClass} ${isStar ? "star-tile" : ""}`}
                  style={{ gridRow: r + 1, gridColumn: c + 1 }}
                >
                  {isStar && <span className="stone-star">★</span>}
                  {renderCellTokens(r, c)}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Players Row */}
      <div className="profiles-horizontal-bar">
        {renderPlayerProfile("blue", "corner-blue")}
        {renderPlayerProfile("yellow", "corner-yellow")}
      </div>

      {/* Bottom Actions Bar */}
      <div className="island-control-bar">
        <button className="island-btn btn-restart" onClick={restartGame}>
          <span className="btn-icon">↺</span> Restart
        </button>
        <button className="island-btn btn-exit" onClick={exitGame}>
          <span className="btn-icon">✕</span> Exit
        </button>
      </div>

      {/* ========================================================
          SIMPLIFIED VICTORY SCOREBOARD MODAL (Medal + Name + Win/Lose)
         ======================================================== */}
      {gameState?.gameOver && (
        <div className="ludo-podium-overlay">
          <div className="ludo-podium-card">
            <span className="podium-top-badge">🏆 MATCH COMPLETED</span>
            <h2 className="podium-title">Final Standings</h2>

            <div className="podium-ranks-list">
              {getRankedPlayerList().map(({ color, name, rank }) => (
                <div key={color} className="podium-rank-row">
                  {/* Left: Medal Icon only */}
                  <div className="rank-medal-col">
                    <span className="medal-ico">{RANK_DATA[rank]?.icon}</span>
                  </div>

                  {/* Center: Player Name */}
                  <div className="rank-name-col">
                    <strong className="player-display-name">{name}</strong>
                  </div>

                  {/* Right: WIN / LOSE Status badge */}
                  <div className="rank-status-col">
                    <span className={`status-pill ${RANK_DATA[rank]?.badgeClass}`}>
                      {RANK_DATA[rank]?.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="podium-actions">
              <button className="podium-btn btn-playagain" onClick={restartGame}>
                ↺ Play Again
              </button>
              <button className="podium-btn btn-menu" onClick={exitGame}>
                Back to Arcade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}