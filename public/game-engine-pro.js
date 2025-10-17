/**
 * 🎮 BarodaTek Game Engine Pro
 * Complete game management with persistence, achievements, leaderboards
 * Author: BarodaTek Services
 * Version: 2.0.0
 */

class GameEnginePro {
    constructor() {
        this.storageKey = 'barodatek_game_data';
        this.gameData = this.loadGameData();
        this.currentGame = null;
        this.soundEnabled = true;
        this.achievementQueue = [];
        
        // Initialize sounds
        this.sounds = {
            correct: this.createSound(800, 0.1),
            wrong: this.createSound(200, 0.2),
            achievement: this.createSound(1200, 0.15),
            levelUp: this.createSound(1000, 0.2)
        };
    }

    /**
     * Load game data from localStorage
     */
    loadGameData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Failed to load game data:', error);
        }
        
        // Default game data structure
        return {
            profile: {
                username: 'Player',
                totalGamesPlayed: 0,
                totalScore: 0,
                lastPlayed: null
            },
            games: {
                'api-quiz': this.createGameStats(),
                'debug-detective': this.createGameStats(),
                'syntax-speed': this.createGameStats(),
                'algorithm-puzzle': this.createGameStats()
            },
            achievements: [],
            leaderboards: {
                'api-quiz': [],
                'debug-detective': [],
                'syntax-speed': [],
                'algorithm-puzzle': []
            },
            settings: {
                sound: true,
                difficulty: 'medium',
                theme: 'dark'
            }
        };
    }

    /**
     * Create default stats for a game
     */
    createGameStats() {
        return {
            played: 0,
            highScore: 0,
            totalScore: 0,
            averageScore: 0,
            bestTime: null,
            currentLevel: 1,
            completions: 0,
            perfectScores: 0,
            hintsUsed: 0,
            achievements: []
        };
    }

    /**
     * Save game data to localStorage
     */
    saveGameData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.gameData));
            return true;
        } catch (error) {
            console.error('Failed to save game data:', error);
            return false;
        }
    }

    /**
     * Start a new game session
     */
    startGame(gameType, difficulty = 'medium') {
        this.currentGame = {
            type: gameType,
            difficulty: difficulty,
            score: 0,
            startTime: Date.now(),
            questionsAnswered: 0,
            correctAnswers: 0,
            hintsUsed: 0,
            timeSpent: 0,
            completed: false
        };
        
        // Update profile
        this.gameData.profile.totalGamesPlayed++;
        this.gameData.games[gameType].played++;
        this.gameData.profile.lastPlayed = new Date().toISOString();
        
        this.saveGameData();
        return this.currentGame;
    }

    /**
     * Answer a question
     */
    answerQuestion(isCorrect, points = 100) {
        if (!this.currentGame) return;
        
        this.currentGame.questionsAnswered++;
        
        if (isCorrect) {
            this.currentGame.correctAnswers++;
            this.currentGame.score += points;
            this.playSound('correct');
            
            // Check for achievements
            this.checkAchievements();
        } else {
            this.playSound('wrong');
        }
        
        return {
            correct: isCorrect,
            score: this.currentGame.score,
            accuracy: (this.currentGame.correctAnswers / this.currentGame.questionsAnswered * 100).toFixed(1)
        };
    }

    /**
     * Use a hint
     */
    useHint() {
        if (!this.currentGame) return;
        
        this.currentGame.hintsUsed++;
        this.gameData.games[this.currentGame.type].hintsUsed++;
        this.saveGameData();
    }

    /**
     * Complete the current game
     */
    completeGame() {
        if (!this.currentGame) return null;
        
        this.currentGame.completed = true;
        this.currentGame.timeSpent = Date.now() - this.currentGame.startTime;
        
        const gameStats = this.gameData.games[this.currentGame.type];
        
        // Update stats
        gameStats.completions++;
        gameStats.totalScore += this.currentGame.score;
        gameStats.averageScore = Math.round(gameStats.totalScore / gameStats.played);
        
        // Check high score
        const isNewHighScore = this.currentGame.score > gameStats.highScore;
        if (isNewHighScore) {
            gameStats.highScore = this.currentGame.score;
            this.unlockAchievement('high_score', `New High Score: ${this.currentGame.score}`);
            this.playSound('levelUp');
        }
        
        // Check perfect score
        if (this.currentGame.questionsAnswered === this.currentGame.correctAnswers && this.currentGame.hintsUsed === 0) {
            gameStats.perfectScores++;
            this.unlockAchievement('perfect', 'Perfect Score - No Mistakes!');
        }
        
        // Check speed achievements
        const timeInSeconds = this.currentGame.timeSpent / 1000;
        if (timeInSeconds < 60 && this.currentGame.questionsAnswered >= 5) {
            this.unlockAchievement('speed_demon', 'Completed in under 60 seconds!');
        }
        
        // Update best time
        if (!gameStats.bestTime || this.currentGame.timeSpent < gameStats.bestTime) {
            gameStats.bestTime = this.currentGame.timeSpent;
        }
        
        // Update profile
        this.gameData.profile.totalScore += this.currentGame.score;
        
        // Add to leaderboard
        this.addToLeaderboard(this.currentGame);
        
        // Level up check
        if (gameStats.completions % 5 === 0) {
            gameStats.currentLevel++;
            this.unlockAchievement('level_up', `Level ${gameStats.currentLevel} Reached!`);
            this.playSound('levelUp');
        }
        
        this.saveGameData();
        
        return {
            ...this.currentGame,
            isNewHighScore,
            currentLevel: gameStats.currentLevel,
            achievements: this.achievementQueue.splice(0)
        };
    }

    /**
     * Add score to leaderboard
     */
    addToLeaderboard(gameSession) {
        const leaderboard = this.gameData.leaderboards[gameSession.type];
        
        leaderboard.push({
            username: this.gameData.profile.username,
            score: gameSession.score,
            time: gameSession.timeSpent,
            accuracy: (gameSession.correctAnswers / gameSession.questionsAnswered * 100).toFixed(1),
            date: new Date().toISOString(),
            difficulty: gameSession.difficulty
        });
        
        // Sort by score (descending) and keep top 100
        leaderboard.sort((a, b) => b.score - a.score);
        this.gameData.leaderboards[gameSession.type] = leaderboard.slice(0, 100);
    }

    /**
     * Check for achievements
     */
    checkAchievements() {
        if (!this.currentGame) return;
        
        const gameStats = this.gameData.games[this.currentGame.type];
        
        // First win
        if (gameStats.played === 1 && this.currentGame.correctAnswers === 1) {
            this.unlockAchievement('first_win', 'First Correct Answer!');
        }
        
        // Streak achievements
        if (this.currentGame.correctAnswers === 5) {
            this.unlockAchievement('streak_5', '5 Correct in a Row!');
        }
        
        if (this.currentGame.correctAnswers === 10) {
            this.unlockAchievement('streak_10', '10 Correct in a Row!');
        }
        
        // Games played milestones
        if (gameStats.played === 10) {
            this.unlockAchievement('veteran_10', 'Played 10 Times!');
        }
        
        if (gameStats.played === 50) {
            this.unlockAchievement('veteran_50', 'Played 50 Times!');
        }
        
        if (gameStats.played === 100) {
            this.unlockAchievement('master_100', 'Master - 100 Games!');
        }
    }

    /**
     * Unlock an achievement
     */
    unlockAchievement(id, title, description = '') {
        // Check if already unlocked
        const existing = this.gameData.achievements.find(a => a.id === id);
        if (existing) return;
        
        const achievement = {
            id,
            title,
            description,
            unlockedAt: new Date().toISOString(),
            game: this.currentGame ? this.currentGame.type : 'general'
        };
        
        this.gameData.achievements.push(achievement);
        this.achievementQueue.push(achievement);
        this.playSound('achievement');
        
        // Show achievement notification
        this.showAchievementNotification(achievement);
    }

    /**
     * Show achievement notification
     */
    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">🏆</div>
                <div class="achievement-text">
                    <div class="achievement-title">${achievement.title}</div>
                    <div class="achievement-desc">${achievement.description}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }

    /**
     * Get leaderboard
     */
    getLeaderboard(gameType, limit = 10) {
        return this.gameData.leaderboards[gameType].slice(0, limit);
    }

    /**
     * Get player rank
     */
    getPlayerRank(gameType) {
        const leaderboard = this.gameData.leaderboards[gameType];
        const playerHighScore = this.gameData.games[gameType].highScore;
        
        let rank = 1;
        for (const entry of leaderboard) {
            if (entry.score > playerHighScore) {
                rank++;
            }
        }
        
        return {
            rank,
            total: leaderboard.length,
            highScore: playerHighScore
        };
    }

    /**
     * Get all achievements
     */
    getAchievements() {
        return this.gameData.achievements;
    }

    /**
     * Get game statistics
     */
    getGameStats(gameType) {
        return this.gameData.games[gameType];
    }

    /**
     * Get profile
     */
    getProfile() {
        return this.gameData.profile;
    }

    /**
     * Update profile
     */
    updateProfile(updates) {
        this.gameData.profile = { ...this.gameData.profile, ...updates };
        this.saveGameData();
    }

    /**
     * Reset game data
     */
    resetGameData(gameType = null) {
        if (gameType) {
            this.gameData.games[gameType] = this.createGameStats();
            this.gameData.leaderboards[gameType] = [];
        } else {
            this.gameData = this.loadGameData();
        }
        this.saveGameData();
    }

    /**
     * Create sound using Web Audio API
     */
    createSound(frequency, duration) {
        return () => {
            if (!this.soundEnabled) return;
            
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            } catch (error) {
                console.error('Sound playback failed:', error);
            }
        };
    }

    /**
     * Play sound
     */
    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }

    /**
     * Toggle sound
     */
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.gameData.settings.sound = this.soundEnabled;
        this.saveGameData();
        return this.soundEnabled;
    }

    /**
     * Export game data
     */
    exportData() {
        return JSON.stringify(this.gameData, null, 2);
    }

    /**
     * Import game data
     */
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            this.gameData = data;
            this.saveGameData();
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }

    /**
     * Get difficulty multiplier
     */
    getDifficultyMultiplier(difficulty) {
        const multipliers = {
            easy: 0.8,
            medium: 1.0,
            hard: 1.5,
            expert: 2.0
        };
        return multipliers[difficulty] || 1.0;
    }

    /**
     * Calculate points based on time and difficulty
     */
    calculatePoints(basePoints, timeSpent, difficulty) {
        const multiplier = this.getDifficultyMultiplier(difficulty);
        const timeBonus = Math.max(0, 100 - Math.floor(timeSpent / 1000));
        return Math.round((basePoints + timeBonus) * multiplier);
    }
}

// Initialize global game engine
window.gameEngine = new GameEnginePro();

// Add achievement notification styles
const style = document.createElement('style');
style.textContent = `
.achievement-notification {
    position: fixed;
    top: 20px;
    right: -400px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px 20px;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    z-index: 10000;
    transition: right 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    min-width: 300px;
    max-width: 400px;
}

.achievement-notification.show {
    right: 20px;
}

.achievement-content {
    display: flex;
    align-items: center;
    gap: 15px;
}

.achievement-icon {
    font-size: 48px;
    animation: bounce 1s infinite;
}

.achievement-text {
    flex: 1;
}

.achievement-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 5px;
}

.achievement-desc {
    font-size: 14px;
    opacity: 0.9;
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

.game-stats-panel {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 15px;
    margin: 20px 0;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    border-bottom: 1px solid rgba(255,255,255,0.2);
}

.stat-item:last-child {
    border-bottom: none;
}

.leaderboard-entry {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background: rgba(255,255,255,0.1);
    margin: 5px 0;
    border-radius: 5px;
}

.leaderboard-entry.player {
    background: rgba(255,215,0,0.3);
    border: 2px solid gold;
}

.rank-badge {
    background: gold;
    color: #333;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
}

.difficulty-selector {
    display: flex;
    gap: 10px;
    margin: 15px 0;
}

.difficulty-btn {
    flex: 1;
    padding: 10px;
    border: 2px solid transparent;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s;
}

.difficulty-btn.easy { background: #4ade80; }
.difficulty-btn.medium { background: #fbbf24; }
.difficulty-btn.hard { background: #f87171; }
.difficulty-btn.expert { background: #a855f7; }

.difficulty-btn.selected {
    border-color: white;
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(255,255,255,0.5);
}
`;
document.head.appendChild(style);

console.log('🎮 BarodaTek Game Engine Pro loaded successfully!');
