// RPSGame.jsx
import { useState } from "react";
import "./RPSGame.css";

const HAND_ICONS = {
    ROCK: "✊",
    PAPER: "✋",
    SCISSORS: "✌️"
};

function RPSGame() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastPlayerChoice, setLastPlayerChoice] = useState(null);
    const [score, setScore] = useState(0);

    // Player name states
    const [playerName, setPlayerName] = useState("Player");
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState("Player");

    const playGame = async (choice) => {
        setLoading(true);
        setLastPlayerChoice(choice);

        try {
            const response = await fetch("https://classic-arcade-backend.onrender.com/api/rps/play", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    playerChoice: choice
                })
            });

            const data = await response.json();
            setResult(data);

            const resText = (data?.result || "").toUpperCase();
            if (resText.includes("WIN") && !resText.includes("COMPUTER")) {
                setScore((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error:", error);
            setResult({
                result: "Unable to connect to server"
            });
        }

        setLoading(false);
    };

    const resetGame = () => {
        setResult(null);
        setLastPlayerChoice(null);
        setLoading(false);
        setScore(0);
    };

    const handleSaveName = () => {
        const trimmed = tempName.trim();
        if (trimmed) {
            setPlayerName(trimmed);
        } else {
            setPlayerName("Player");
            setTempName("Player");
        }
        setIsEditingName(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSaveName();
        } else if (e.key === "Escape") {
            setTempName(playerName);
            setIsEditingName(false);
        }
    };

    const getResultBannerClass = () => {
        if (!result) return "";
        const resText = (result.result || "").toUpperCase();
        if (resText.includes("WIN") && !resText.includes("COMPUTER")) return "banner-win";
        if (resText.includes("LOSE") || resText.includes("COMPUTER")) return "banner-lose";
        return "banner-tie";
    };

    return (
        <div className="rps-full-screen-container">
            <div className="rps-content-wrapper">

                {/* Top: Computer Area */}
                <div className="rps-zone-box">
                    <span className="rps-zone-title">Computer</span>
                    <div className="rps-dashed-slot">
                        {result?.computerChoice ? (
                            <span className="rps-hand-emoji comp-inverted">
                                {HAND_ICONS[result.computerChoice.toUpperCase()] || "🤖"}
                            </span>
                        ) : (
                            <span className="rps-slot-empty">?</span>
                        )}
                    </div>
                </div>

                {/* Center: Result Banner */}
                <div className="rps-status-strip">
                    {result ? (
                        <div className={`rps-banner-pill ${getResultBannerClass()}`}>
                            {result.result}
                        </div>
                    ) : (
                        <div className="rps-banner-pill banner-idle">
                            Choose your move
                        </div>
                    )}
                </div>

                {/* Middle: Player Area with Inline Editable Badge */}
                <div className="rps-zone-box">
                    {isEditingName ? (
                        <div className="rps-name-edit-box">
                            <input
                                type="text"
                                className="rps-name-input"
                                value={tempName}
                                maxLength={12}
                                autoFocus
                                onChange={(e) => setTempName(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button className="rps-name-save-btn" onClick={handleSaveName}>
                                ✓
                            </button>
                        </div>
                    ) : (
                        <div
                            className="rps-player-badge"
                            onClick={() => {
                                setTempName(playerName);
                                setIsEditingName(true);
                            }}
                            title="Click to edit name"
                        >
                            <span className="rps-zone-title">{playerName}</span>
                            <span className="rps-edit-icon">✏️</span>
                        </div>
                    )}

                    <div className="rps-dashed-slot">
                        {lastPlayerChoice ? (
                            <span className="rps-hand-emoji player-active">
                                {HAND_ICONS[lastPlayerChoice.toUpperCase()] || "👤"}
                            </span>
                        ) : (
                            <span className="rps-slot-empty">?</span>
                        )}
                    </div>
                </div>

                {/* Score Counter */}
                <div className="rps-score-display">
                    Your score: <strong>{score}</strong>
                </div>

                {/* Bottom: 3 Choice Cards */}
                <div className="rps-choice-row">
                    <button
                        className={`rps-card-btn ${lastPlayerChoice === "PAPER" ? "active-pick" : ""}`}
                        onClick={() => playGame("PAPER")}
                        disabled={loading}
                    >
                        <span className="btn-hand-icon">✋</span>
                        <span className="btn-label">paper</span>
                    </button>

                    <button
                        className={`rps-card-btn ${lastPlayerChoice === "ROCK" ? "active-pick" : ""}`}
                        onClick={() => playGame("ROCK")}
                        disabled={loading}
                    >
                        <span className="btn-hand-icon">✊</span>
                        <span className="btn-label">rock</span>
                    </button>

                    <button
                        className={`rps-card-btn ${lastPlayerChoice === "SCISSORS" ? "active-pick" : ""}`}
                        onClick={() => playGame("SCISSORS")}
                        disabled={loading}
                    >
                        <span className="btn-hand-icon">✌️</span>
                        <span className="btn-label">scissors</span>
                    </button>
                </div>

                {/* Reset Control */}
                <div className="rps-footer-action">
                    <button className="rps-reset-btn" onClick={resetGame}>
                        ↺ Reset Game
                    </button>
                </div>

            </div>
        </div>
    );
}

export default RPSGame;