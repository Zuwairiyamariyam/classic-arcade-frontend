import { useState } from "react";
import "./TicTacToeGame.css";

const API_BASE_URL = `http://${window.location.hostname || "192.168.29.229"}:8080/api/tictactoe`;

function TicTacToeGame() {
    const [gameMode, setGameMode] = useState(null);

    const [playerSymbol, setPlayerSymbol] = useState(null);
    const [difficulty, setDifficulty] = useState(null);

    const [board, setBoard] = useState([
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]
    ]);

    const [result, setResult] = useState("");
    const [gameOver, setGameOver] = useState(false);
    const [loading, setLoading] = useState(false);

    // Local Multiplayer
    const [currentPlayer, setCurrentPlayer] = useState("X");
    const [player1Name, setPlayer1Name] = useState("");
    const [player2Name, setPlayer2Name] = useState("");
    const [localGameStarted, setLocalGameStarted] = useState(false);

    const createEmptyBoard = () => [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]
    ];

    // =========================
    // CHOOSE GAME MODE
    // =========================
    const chooseGameMode = async (mode) => {
        setGameMode(mode);
        setPlayerSymbol(null);
        setDifficulty(null);
        setBoard(createEmptyBoard());
        setResult("");
        setGameOver(false);
        setCurrentPlayer("X");
        setLoading(false);

        if (mode === "COMPUTER") {
            try {
                await fetch(`${API_BASE_URL}/reset`);
            } catch (error) {
                console.error("Backend reset error:", error);
            }
        }
    };

    // =========================
    // COMPUTER MODE
    // =========================
    const chooseSymbol = async (symbol) => {
        setPlayerSymbol(symbol);
        setDifficulty(null);
        setBoard(createEmptyBoard());
        setResult("");
        setGameOver(false);

        try {
            await fetch(`${API_BASE_URL}/reset`);
        } catch (error) {
            console.error("Backend reset error:", error);
        }
    };

    const makeComputerMove = async (row, col) => {
        if (!playerSymbol || !difficulty || gameOver || loading) return;
        if (board[row][col] !== "") return;

        // Immediate user symbol render for zero-lag mobile feedback
        const updatedBoard = board.map((r) => [...r]);
        updatedBoard[row][col] = playerSymbol;
        setBoard(updatedBoard);
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/play`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    playerSymbol: playerSymbol,
                    row: row,
                    col: col,
                    difficulty: difficulty
                })
            });

            const data = await response.json();

            setBoard(data.board);
            setResult(data.result);
            setGameOver(data.gameOver);
        } catch (error) {
            console.error("Error:", error);
            setResult("Unable to connect to server");
        }

        setLoading(false);
    };

    // =========================
    // LOCAL MULTIPLAYER
    // =========================
    const startLocalGame = () => {
        if (player1Name.trim() === "" || player2Name.trim() === "") {
            return;
        }

        setBoard(createEmptyBoard());
        setCurrentPlayer("X");
        setResult("");
        setGameOver(false);
        setLocalGameStarted(true);
    };

    const makeLocalMove = (row, col) => {
        if (gameOver) return;
        if (board[row][col] !== "") return;

        const newBoard = board.map((boardRow) => [...boardRow]);
        newBoard[row][col] = currentPlayer;
        setBoard(newBoard);

        // Check winner
        if (checkWinner(newBoard, currentPlayer)) {
            const winnerName = currentPlayer === "X" ? player1Name : player2Name;
            setResult(`🎉 ${winnerName} Won the Game!`);
            setGameOver(true);
            return;
        }

        // Check draw
        if (isBoardFull(newBoard)) {
            setResult("🤝 It's a Draw!");
            setGameOver(true);
            return;
        }

        // Change player
        setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    };

    const checkWinner = (currentBoard, symbol) => {
        for (let row = 0; row < 3; row++) {
            if (
                currentBoard[row][0] === symbol &&
                currentBoard[row][1] === symbol &&
                currentBoard[row][2] === symbol
            ) {
                return true;
            }
        }

        for (let col = 0; col < 3; col++) {
            if (
                currentBoard[0][col] === symbol &&
                currentBoard[1][col] === symbol &&
                currentBoard[2][col] === symbol
            ) {
                return true;
            }
        }

        if (
            currentBoard[0][0] === symbol &&
            currentBoard[1][1] === symbol &&
            currentBoard[2][2] === symbol
        ) {
            return true;
        }

        if (
            currentBoard[0][2] === symbol &&
            currentBoard[1][1] === symbol &&
            currentBoard[2][0] === symbol
        ) {
            return true;
        }

        return false;
    };

    const isBoardFull = (currentBoard) => {
        return currentBoard.every((row) =>
            row.every((cell) => cell !== "")
        );
    };

    // =========================
    // RESET GAME
    // =========================
    const resetGame = async () => {
        setBoard(createEmptyBoard());
        setResult("");
        setGameOver(false);
        setCurrentPlayer("X");

        if (gameMode === "COMPUTER") {
            setPlayerSymbol(null);
            setDifficulty(null);

            try {
                await fetch(`${API_BASE_URL}/reset`);
            } catch (error) {
                console.error("Reset error:", error);
            }
        }
    };

    // =========================
    // BACK TO GAME MODE
    // =========================
    const backToGameModes = async () => {
        setGameMode(null);
        setPlayerSymbol(null);
        setDifficulty(null);
        setBoard(createEmptyBoard());
        setResult("");
        setGameOver(false);
        setCurrentPlayer("X");
        setLoading(false);

        setPlayer1Name("");
        setPlayer2Name("");
        setLocalGameStarted(false);

        try {
            await fetch(`${API_BASE_URL}/reset`);
        } catch (error) {
            console.error("Reset error:", error);
        }
    };

    return (
        <div className="ttt-dark-viewport">
            <div className="ttt-dark-card">

                {/* SCREEN 1: CHOOSE GAME MODE */}
                {!gameMode && (
                    <div className="ttt-view-section">
                        <div className="ttt-dark-hero-box">
                            <h1 className="ttt-hero-title">Tic Tac Toe</h1>
                            <div className="ttt-hero-duo-icons">
                                <span className="hero-glyph-x">✕</span>
                                <span className="hero-glyph-o">◯</span>
                            </div>
                        </div>

                        <div className="ttt-pill-btn-group">
                            <button
                                className="ttt-pill-action-btn primary-glow"
                                onClick={() => chooseGameMode("COMPUTER")}
                            >
                                SINGLE PLAYER
                            </button>

                            <button
                                className="ttt-pill-action-btn secondary-dim"
                                onClick={() => chooseGameMode("LOCAL")}
                            >
                                WITH A FRIEND
                            </button>
                        </div>
                    </div>
                )}

                {/* SCREEN 2: CHOOSE SYMBOL */}
                {gameMode === "COMPUTER" && !playerSymbol && (
                    <div className="ttt-view-section">
                        <h2 className="ttt-card-title">CHOOSE YOUR SIDE</h2>

                        <div className="ttt-symbol-choices">
                            <div
                                className="ttt-symbol-card choice-neon-x"
                                onClick={() => chooseSymbol("X")}
                            >
                                <span className="glyph-symbol glyph-x">✕</span>
                                <span className="glyph-label">Plays First</span>
                            </div>

                            <div
                                className="ttt-symbol-card choice-neon-o"
                                onClick={() => chooseSymbol("O")}
                            >
                                <span className="glyph-symbol glyph-o">◯</span>
                                <span className="glyph-label">Plays Second</span>
                            </div>
                        </div>

                        <button className="ttt-nav-back-link" onClick={backToGameModes}>
                            ← Back
                        </button>
                    </div>
                )}

                {/* SCREEN 3: CHOOSE DIFFICULTY */}
                {gameMode === "COMPUTER" && playerSymbol && !difficulty && (
                    <div className="ttt-view-section">
                        <h2 className="ttt-card-title">SELECT DIFFICULTY</h2>
                        <div className="ttt-sub-tag">
                            You are playing as:{" "}
                            <span className={playerSymbol === "X" ? "glow-color-x" : "glow-color-o"}>
                                {playerSymbol === "X" ? "✕" : "◯"}
                            </span>
                        </div>

                        <div className="ttt-pill-btn-group">
                            <button
                                className="ttt-pill-action-btn diff-btn-easy"
                                onClick={() => setDifficulty("EASY")}
                            >
                                EASY
                            </button>
                            <button
                                className="ttt-pill-action-btn diff-btn-medium"
                                onClick={() => setDifficulty("MEDIUM")}
                            >
                                MEDIUM
                            </button>
                            <button
                                className="ttt-pill-action-btn diff-btn-hard"
                                onClick={() => setDifficulty("HARD")}
                            >
                                HARD
                            </button>
                        </div>

                        <button className="ttt-nav-back-link" onClick={() => setPlayerSymbol(null)}>
                            ← Back
                        </button>
                    </div>
                )}

                {/* SCREEN 4: COMPUTER GAMEPLAY */}
                {gameMode === "COMPUTER" && playerSymbol && difficulty && (
                    <div className="ttt-view-section">
                        <div className="ttt-arena-top-row">
                            <div className="ttt-status-capsule">
                                <span className="capsule-icon glow-color-x">✕</span>
                                <span className="capsule-text">{playerSymbol === "X" ? "Player" : "Computer"}</span>
                            </div>

                            <div className={`ttt-diff-pill diff-${difficulty?.toLowerCase()}`}>
                                <span className="diff-indicator-dot"></span>
                                <span>{difficulty}</span>
                            </div>

                            <div className="ttt-status-capsule">
                                <span className="capsule-icon glow-color-o">◯</span>
                                <span className="capsule-text">{playerSymbol === "O" ? "Player" : "Computer"}</span>
                            </div>
                        </div>

                        <div className="ttt-turn-announcer">
                            {loading
                                ? "🤖 Computer is thinking..."
                                : gameOver
                                ? result
                                : "🎯 Your Turn"}
                        </div>

                        <div className="ttt-dark-grid-board">
                            {board.map((row, rowIndex) =>
                                row.map((cell, colIndex) => (
                                    <button
                                        key={`${rowIndex}-${colIndex}`}
                                        className={`ttt-grid-tile ${
                                            cell === "X" ? "tile-x" : cell === "O" ? "tile-o" : ""
                                        }`}
                                        onClick={() => makeComputerMove(rowIndex, colIndex)}
                                        disabled={gameOver || loading || cell !== ""}
                                    >
                                        {cell === "X" ? "✕" : cell === "O" ? "◯" : ""}
                                    </button>
                                ))
                            )}
                        </div>

                        <div className="ttt-arena-actions">
                            <button className="ttt-ctrl-btn" onClick={resetGame}>
                                <span className="btn-icon">↺</span> Restart
                            </button>
                            <button className="ttt-ctrl-btn" onClick={backToGameModes}>
                                <span className="btn-icon">←</span> Mode
                            </button>
                        </div>
                    </div>
                )}

                {/* SCREEN 5: LOCAL MULTIPLAYER SETUP */}
                {gameMode === "LOCAL" && !localGameStarted && (
                    <div className="ttt-view-section">
                        <h2 className="ttt-card-title">With a Friend</h2>
                        <p className="ttt-sub-tag">Enter names to begin </p>

                        <div className="ttt-input-fields-list">
                            <div className="ttt-field-group border-neon-x">
                                <label className="glow-color-x">✕ Player 1</label>
                                <input
                                    type="text"
                                    placeholder="Enter Player 1 Name"
                                    value={player1Name}
                                    onChange={(e) => setPlayer1Name(e.target.value)}
                                    maxLength="15"
                                />
                            </div>

                            <div className="ttt-field-group border-neon-o">
                                <label className="glow-color-o">◯ Player 2</label>
                                <input
                                    type="text"
                                    placeholder="Enter Player 2 Name"
                                    value={player2Name}
                                    onChange={(e) => setPlayer2Name(e.target.value)}
                                    maxLength="15"
                                />
                            </div>
                        </div>

                        <button
                            className="ttt-pill-action-btn primary-glow"
                            onClick={startLocalGame}
                            disabled={player1Name.trim() === "" || player2Name.trim() === ""}
                        >
                            CONTINUE
                        </button>

                        <button className="ttt-nav-back-link" onClick={backToGameModes}>
                            ← Back
                        </button>
                    </div>
                )}

                {/* SCREEN 6: LOCAL GAMEPLAY */}
                {gameMode === "LOCAL" && localGameStarted && (
                    <div className="ttt-view-section">
                        <div className="ttt-arena-top-row">
                            <div
                                className={`ttt-status-capsule ${
                                    currentPlayer === "X" && !gameOver ? "glow-active-x" : ""
                                }`}
                            >
                                <span className="capsule-icon glow-color-x">✕</span>
                                <span className="capsule-text">{player1Name}</span>
                            </div>

                            <div
                                className={`ttt-status-capsule ${
                                    currentPlayer === "O" && !gameOver ? "glow-active-o" : ""
                                }`}
                            >
                                <span className="capsule-icon glow-color-o">◯</span>
                                <span className="capsule-text">{player2Name}</span>
                            </div>
                        </div>

                        <div className="ttt-turn-announcer">
                            {gameOver
                                ? result
                                : `🎯 ${currentPlayer === "X" ? player1Name : player2Name}'s Turn`}
                        </div>

                        <div className="ttt-dark-grid-board">
                            {board.map((row, rowIndex) =>
                                row.map((cell, colIndex) => (
                                    <button
                                        key={`${rowIndex}-${colIndex}`}
                                        className={`ttt-grid-tile ${
                                            cell === "X" ? "tile-x" : cell === "O" ? "tile-o" : ""
                                        }`}
                                        onClick={() => makeLocalMove(rowIndex, colIndex)}
                                        disabled={gameOver || cell !== ""}
                                    >
                                        {cell === "X" ? "✕" : cell === "O" ? "◯" : ""}
                                    </button>
                                ))
                            )}
                        </div>

                        <div className="ttt-arena-actions">
                            <button className="ttt-ctrl-btn" onClick={resetGame}>
                                <span className="btn-icon">↺</span> Restart
                            </button>
                            <button className="ttt-ctrl-btn" onClick={backToGameModes}>
                                <span className="btn-icon">←</span> Mode
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default TicTacToeGame;