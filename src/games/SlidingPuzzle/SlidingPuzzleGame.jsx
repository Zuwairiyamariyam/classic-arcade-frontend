// SlidingPuzzleGame.jsx
import { useEffect, useState } from "react";
import "./SlidingPuzzleGame.css";
import { playTileSlideSound, playWinSound } from "../../utils/soundFX";

const SOLVED_BOARD = [1, 2, 3, 4, 5, 6, 7, 8, 0];

// Total 25 Diverse High-Quality Puzzle Images (10 Original + 15 New)
const IMAGE_OPTIONS = [
  "https://picsum.photos/seed/puzzle-forest/600/600",
  "https://picsum.photos/seed/puzzle-mountains/600/600",
  "https://picsum.photos/seed/puzzle-ocean/600/600",
  "https://picsum.photos/seed/puzzle-flowers/600/600",
  "https://picsum.photos/seed/puzzle-city/600/600",
  "https://picsum.photos/seed/puzzle-nature/600/600",
  "https://picsum.photos/seed/puzzle-animals/600/600",
  "https://picsum.photos/seed/puzzle-sunset/600/600",
  "https://picsum.photos/seed/puzzle-travel/600/600",
  "https://picsum.photos/seed/puzzle-garden/600/600",
  // 15 Extra Hand-picked Themes
  "https://picsum.photos/seed/puzzle-galaxy/600/600",
  "https://picsum.photos/seed/puzzle-desert/600/600",
  "https://picsum.photos/seed/puzzle-waterfall/600/600",
  "https://picsum.photos/seed/puzzle-aurora/600/600",
  "https://picsum.photos/seed/puzzle-castle/600/600",
  "https://picsum.photos/seed/puzzle-autumn/600/600",
  "https://picsum.photos/seed/puzzle-winter/600/600",
  "https://picsum.photos/seed/puzzle-island/600/600",
  "https://picsum.photos/seed/puzzle-wildlife/600/600",
  "https://picsum.photos/seed/puzzle-architecture/600/600",
  "https://picsum.photos/seed/puzzle-lake/600/600",
  "https://picsum.photos/seed/puzzle-sunrise/600/600",
  "https://picsum.photos/seed/puzzle-canyon/600/600",
  "https://picsum.photos/seed/puzzle-lighthouse/600/600",
  "https://picsum.photos/seed/puzzle-blossom/600/600",
];

IMAGE_OPTIONS.forEach((image) => {
  const img = new Image();
  img.src = image;
});

function getRandomImage(previousImage = null) {
  const availableImages = IMAGE_OPTIONS.filter(
    (image) => image !== previousImage
  );

  const randomIndex = Math.floor(
    Math.random() * availableImages.length
  );

  return availableImages[randomIndex];
}

function createShuffledBoard() {
  let board = [...SOLVED_BOARD];
  let previousEmptyIndex = -1;

  for (let i = 0; i < 100; i++) {
    const emptyIndex = board.indexOf(0);
    const emptyRow = Math.floor(emptyIndex / 3);
    const emptyCol = emptyIndex % 3;

    const possibleMoves = [];

    for (let index = 0; index < 9; index++) {
      const row = Math.floor(index / 3);
      const col = index % 3;

      const distance =
        Math.abs(emptyRow - row) + Math.abs(emptyCol - col);

      if (distance === 1 && index !== previousEmptyIndex) {
        possibleMoves.push(index);
      }
    }

    const randomIndex =
      possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

    [board[emptyIndex], board[randomIndex]] = [
      board[randomIndex],
      board[emptyIndex],
    ];

    previousEmptyIndex = emptyIndex;
  }

  if (board.every((value, index) => value === SOLVED_BOARD[index])) {
    [board[0], board[1]] = [board[1], board[0]];
  }

  return board;
}

function SlidingPuzzleGame() {
  const [mode, setMode] = useState(null);
  const [board, setBoard] = useState([...SOLVED_BOARD]);
  const [seconds, setSeconds] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  const [selectedImage, setSelectedImage] = useState(IMAGE_OPTIONS[0]);
  const [showWinAlert, setShowWinAlert] = useState(false);

  const isSolved = board.every(
    (value, index) => value === SOLVED_BOARD[index]
  );

  useEffect(() => {
    if (isSolved && mode && hasInteracted) {
      setShowWinAlert(true);
      playWinSound();
    }
  }, [isSolved, mode, hasInteracted]);

  useEffect(() => {
    if (!mode || isSolved) return;

    const timer = setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, isSolved]);

  const startGame = (selectedMode) => {
    setMode(selectedMode);
    setBoard(createShuffledBoard());
    setSeconds(0);
    setHasInteracted(false);
    setShowWinAlert(false);

    if (selectedMode === "IMAGE") {
      setSelectedImage(getRandomImage(selectedImage));
    }
  };

  const moveTile = (clickedIndex) => {
    if (isSolved) return;

    const emptyIndex = board.indexOf(0);
    const emptyRow = Math.floor(emptyIndex / 3);
    const emptyCol = emptyIndex % 3;

    const clickedRow = Math.floor(clickedIndex / 3);
    const clickedCol = clickedIndex % 3;

    const distance = Math.abs(emptyRow - clickedRow) + Math.abs(emptyCol - clickedCol);

    if (distance !== 1) return;

    playTileSlideSound();

    const newBoard = [...board];
    [newBoard[emptyIndex], newBoard[clickedIndex]] = [
      newBoard[clickedIndex],
      newBoard[emptyIndex],
    ];

    setBoard(newBoard);
    setHasInteracted(true);
  };

  const restartGame = () => {
    setBoard(createShuffledBoard());
    setSeconds(0);
    setHasInteracted(false);
    setShowWinAlert(false);

    if (mode === "IMAGE") {
      setSelectedImage(getRandomImage(selectedImage));
    }
  };

  const handleNextPuzzle = () => {
    setShowWinAlert(false);
    setBoard(createShuffledBoard());
    setSeconds(0);
    setHasInteracted(false);

    if (mode === "IMAGE") {
      setSelectedImage(getRandomImage(selectedImage));
    }
  };

  const goBack = () => {
    setMode(null);
    setBoard([...SOLVED_BOARD]);
    setSeconds(0);
    setHasInteracted(false);
    setShowWinAlert(false);
  };

  const formatTime = () => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  return (
    <div className="sliding-puzzle-container">
      {!mode && (
        <div className="puzzle-mode-selection arcade-panel">
          <h1 className="puzzle-title">Sliding Puzzle</h1>
          <p className="puzzle-subtitle">Pick the puzzle mode and start playing</p>

          <div className="mode-btn-container">
            <button
              className="puzzle-mode-button"
              onClick={() => startGame("NUMBER")}
            >
              <div className="mode-btn-content">
                <span className="mode-icon">🔢</span>
                <div className="mode-text">
                  <span className="mode-name">Number Matrix</span>
                  <span className="mode-desc desc-desktop">Arrange numerical blocks in 1 to 8 sequence</span>
                  <span className="mode-desc desc-mobile">Arrange 1 to 8 sequence</span>
                </div>
              </div>
              <span className="mode-arrow">→</span>
            </button>

            <button
              className="puzzle-mode-button"
              onClick={() => startGame("IMAGE")}
            >
              <div className="mode-btn-content">
                <span className="mode-icon">🖼️</span>
                <div className="mode-text">
                  <span className="mode-name">Picture Mosaic</span>
                  <span className="mode-desc desc-desktop">Reconstruct scrambled artwork to solve</span>
                  <span className="mode-desc desc-mobile">Reconstruct artwork</span>
                </div>
              </div>
              <span className="mode-arrow">→</span>
            </button>
          </div>
        </div>
      )}

      {mode && (
        <div className={`puzzle-game-area arcade-panel ${mode === "IMAGE" ? "split-layout" : "single-layout"}`}>
          
          {/* Unified Header Row */}
          <div className="puzzle-top-header-row">
            <span className="mode-pill-indicator">
              {mode === "NUMBER" ? "🔢 NUMBER PATTERN" : "🖼️ PICTURE MOSAIC"}
            </span>
            <div className="header-timer-pill">
              <span className="timer-icon">⏱️</span>
              <strong className="timer-text">{formatTime()}</strong>
            </div>
          </div>

          <div className="puzzle-content-wrapper">
            
            {/* IMAGE MODE: SIDE HUD PANEL */}
            {mode === "IMAGE" && (
              <div className="mosaic-side-hud">
                <div className="image-timer-card mosaic-desktop-timer-card">
                  <span className="image-timer-label">TIME ELAPSED</span>
                  <div className="image-timer-val">
                    <span className="timer-icon">⏱️</span>
                    <strong>{formatTime()}</strong>
                  </div>
                </div>

                <div className="puzzle-preview-box">
                  <span className="preview-label">TARGET REFERENCE</span>
                  <div className="preview-frame">
                    <img src={selectedImage} alt="Puzzle reference target" />
                  </div>
                </div>

                <div className="puzzle-bottom-controls">
                  <button className="arcade-control-pill" onClick={restartGame}>
                    <span className="pill-icon">↺</span> Restart
                  </button>
                  <button className="arcade-control-pill" onClick={goBack}>
                    <span className="pill-icon">←</span> Mode
                  </button>
                </div>
              </div>
            )}

            {/* PUZZLE GRID BOARD */}
            <div className="puzzle-board-wrapper">
              <div className="sliding-puzzle-board">
                {board.map((tile, index) => {
                  if (tile === 0) {
                    return (
                      <button
                        key={index}
                        className="puzzle-tile puzzle-empty"
                        aria-label="Empty tile"
                        disabled
                      />
                    );
                  }

                  const imageRow = Math.floor((tile - 1) / 3);
                  const imageCol = (tile - 1) % 3;

                  return (
                    <button
                      key={index}
                      className={`puzzle-tile ${
                        mode === "IMAGE" ? "image-tile" : "number-tile"
                      }`}
                      onClick={() => moveTile(index)}
                      disabled={isSolved}
                      style={
                        mode === "IMAGE"
                          ? {
                              backgroundImage: `url("${selectedImage}")`,
                              backgroundPosition: `${imageCol * 50}% ${imageRow * 50}%`,
                            }
                          : {}
                      }
                    >
                      {mode === "NUMBER" ? tile : ""}
                    </button>
                  );
                })}
              </div>

              {/* Controls for Number Mode */}
              {mode === "NUMBER" && (
                <div className="puzzle-bottom-controls">
                  <button className="arcade-control-pill" onClick={restartGame}>
                    <span className="pill-icon">↺</span> Restart
                  </button>
                  <button className="arcade-control-pill" onClick={goBack}>
                    <span className="pill-icon">←</span> Mode
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* VICTORY POPUP ALERT MODAL */}
      {showWinAlert && (
        <div className="puzzle-modal-overlay">
          <div className="puzzle-modal-card">
            <div className="modal-badge">SOLVED!</div>
            <h2 className="modal-title">🎉 Puzzle Cleared!</h2>
            <p className="modal-subtitle">
              Awesome job! Completed in <span className="highlight">{formatTime()}</span>.
            </p>
            
            <div className="modal-actions">
              <button className="modal-btn next-btn" onClick={handleNextPuzzle}>
                OK, Next Puzzle ➔
              </button>
              <button className="modal-btn exit-btn" onClick={goBack}>
                Mode Select
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SlidingPuzzleGame;