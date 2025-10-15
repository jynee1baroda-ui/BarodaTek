// Enhanced Interactive Games with Hints & Answer Reveals
// BarodaTek Platform - Interactive Learning Games

class EnhancedGameEngine {
    constructor() {
        this.currentGame = null;
        this.score = 0;
        this.hintsUsed = 0;
        this.currentQuestionIndex = 0;
        this.questions = [];
        this.hintPenalty = 20; // Points deducted for using hint
    }

    // API Quiz Game with Hints
    startAPIQuiz() {
        this.questions = [
            {
                question: "What HTTP method is used to retrieve data?",
                options: ["GET", "POST", "PUT", "DELETE"],
                correct: 0,
                hint: "Think about the word 'getting' something from a server. The method name matches the action!",
                explanation: "GET is the HTTP method used to retrieve/read data from a server without modifying it."
            },
            {
                question: "What status code indicates success?",
                options: ["404", "500", "200", "301"],
                correct: 2,
                hint: "This is a 2xx status code. The first successful HTTP response code!",
                explanation: "200 OK means the request succeeded. 2xx codes indicate success, 4xx client errors, 5xx server errors."
            },
            {
                question: "What does REST stand for?",
                options: [
                    "Really Easy Simple Technology",
                    "Representational State Transfer",
                    "Rapid Execution Service Tool",
                    "Remote Enhanced System Transfer"
                ],
                correct: 1,
                hint: "It's about representing the state of resources and transferring them. Roy Fielding coined this term.",
                explanation: "REST (Representational State Transfer) is an architectural style for distributed hypermedia systems."
            },
            {
                question: "Which HTTP method creates new resources?",
                options: ["GET", "POST", "PUT", "DELETE"],
                correct: 1,
                hint: "You 'post' something new, like posting a letter or a social media post!",
                explanation: "POST creates new resources on the server. PUT updates existing resources, GET retrieves, DELETE removes."
            },
            {
                question: "What status code indicates 'Not Found'?",
                options: ["200", "404", "500", "301"],
                correct: 1,
                hint: "This is the most famous error code! Often seen when a page doesn't exist.",
                explanation: "404 Not Found means the server cannot find the requested resource. It's a client error (4xx)."
            },
            {
                question: "What does JSON stand for?",
                options: [
                    "JavaScript Object Notation",
                    "Just Simple Object Names",
                    "Java Standard Object Network",
                    "Joint System Object Notation"
                ],
                correct: 0,
                hint: "It's a notation format for JavaScript objects. Very common in web APIs!",
                explanation: "JSON (JavaScript Object Notation) is a lightweight data interchange format, easy for humans and machines."
            },
            {
                question: "What is an API endpoint?",
                options: [
                    "The final destination of data",
                    "A URL where an API receives requests",
                    "The ending of an API connection",
                    "A point where errors occur"
                ],
                correct: 1,
                hint: "Think of it as an address where you send requests. Each feature has its own URL!",
                explanation: "An API endpoint is a specific URL where API requests are sent, like /api/users or /api/products."
            },
            {
                question: "What is CORS?",
                options: [
                    "Cross-Origin Resource Sharing",
                    "Computer Origin Response System",
                    "Connected Origin Request Server",
                    "Core Origin Resource Security"
                ],
                correct: 0,
                hint: "It's about sharing resources across different origins (domains). Security feature in browsers!",
                explanation: "CORS allows servers to specify which origins can access their resources, preventing unwanted cross-domain requests."
            }
        ];

        this.renderGameUI('API Galaxy Quiz 🌌', 'api-quiz');
    }

    // Debug Detective Game
    startDebugGame() {
        this.questions = [
            {
                question: "Find the bug: console.log('Hello World)",
                options: [
                    "Missing semicolon",
                    "Missing closing quote",
                    "Wrong function name",
                    "Invalid string"
                ],
                correct: 1,
                hint: "Look at the string! Every opening quote needs a friend to close it.",
                explanation: "The string 'Hello World is missing a closing single quote. It should be 'Hello World'."
            },
            {
                question: "What's wrong? if (x = 5) { }",
                options: [
                    "Nothing is wrong",
                    "Should use == or ===",
                    "Missing semicolon",
                    "Wrong brackets"
                ],
                correct: 1,
                hint: "Single = is assignment, not comparison. We're giving x a value, not checking it!",
                explanation: "Use == or === for comparison. Single = assigns a value. This code assigns 5 to x instead of checking if x equals 5."
            },
            {
                question: "Find the issue: const arr = [1, 2, 3]; arr[3]",
                options: [
                    "Array is too small",
                    "Wrong syntax",
                    "Index out of bounds (returns undefined)",
                    "Should use arr.3"
                ],
                correct: 2,
                hint: "Arrays are zero-indexed! Count from 0: [0]=1, [1]=2, [2]=3. What's at index 3?",
                explanation: "Arrays are zero-indexed. arr[3] tries to access the 4th element, but only 3 exist (indexes 0-2). Returns undefined."
            },
            {
                question: "Bug in: function test() { return \\n { value: 123 } }",
                options: [
                    "Syntax is perfect",
                    "Return statement separated from object",
                    "Missing semicolon",
                    "Wrong brackets"
                ],
                correct: 1,
                hint: "JavaScript adds automatic semicolons! The return line breaks before the object starts.",
                explanation: "JavaScript's automatic semicolon insertion adds ; after 'return', making it return nothing. Put { on same line!"
            },
            {
                question: "What's the error? const x = 10; x = 20;",
                options: [
                    "No error",
                    "Cannot reassign const variables",
                    "Missing var keyword",
                    "Wrong operator"
                ],
                correct: 1,
                hint: "The keyword 'const' means constant - it can't change! Use 'let' if you need to reassign.",
                explanation: "const creates a constant variable that cannot be reassigned. Use 'let' or 'var' for variables that change."
            }
        ];

        this.renderGameUI('🔍 Debug Detective', 'debug-game');
    }

    // Syntax Speed Challenge
    startSyntaxGame() {
        this.questions = [
            {
                question: "Complete: for (let i = 0; i < 10; i__) { }",
                options: ["i--", "i++", "i+=", "i=="],
                correct: 1,
                hint: "We want to increment i by 1 each loop. The ++ operator adds 1!",
                explanation: "i++ increments i by 1. It's shorthand for i = i + 1. Essential for counting loops!"
            },
            {
                question: "Correct arrow function: const add = (a, b) __ a + b;",
                options: [" =", " =>", " :", " ->"],
                correct: 1,
                hint: "Arrow functions use an 'arrow' symbol. It's a fat arrow made of = and >!",
                explanation: "=> creates an arrow function. The arrow points from parameters to the function body."
            },
            {
                question: "Access object property: user__ = 'John';",
                options: [".name", "->name", ":name", "#name"],
                correct: 0,
                hint: "Use a dot to access properties! Like how you use a period in grammar.",
                explanation: "Dot notation (.) accesses object properties: object.property. Can also use bracket notation: object['property']"
            },
            {
                question: "Array method to add item: arr__('item');",
                options: [".add", ".push", ".insert", ".append"],
                correct: 1,
                hint: "Think of pushing an item onto the end of a line. Not add, not insert...",
                explanation: ".push() adds elements to the end of an array. .pop() removes from end, .shift() removes from start."
            },
            {
                question: "Check data type: __x === 'string'",
                options: ["typeof ", "type ", "instanceof ", "typeOf "],
                correct: 0,
                hint: "It's 'typeof' - all lowercase, one word! Returns the type as a string.",
                explanation: "typeof operator returns a string indicating the type: 'string', 'number', 'boolean', 'object', etc."
            }
        ];

        this.renderGameUI('⚡ Syntax Speed Run', 'syntax-game');
    }

    // Render Game UI
    renderGameUI(title, gameType) {
        this.currentGame = gameType;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.hintsUsed = 0;

        const gameBoard = document.getElementById('game-board');
        if (!gameBoard) return;

        // Hide start screen
        const gameStart = document.getElementById('game-start');
        if (gameStart) gameStart.style.display = 'none';

        // Create enhanced game UI
        gameBoard.innerHTML = `
            <div class="enhanced-game-container">
                <div class="game-header mb-4">
                    <h3 class="text-white mb-2">${title}</h3>
                    <div class="game-stats d-flex justify-content-between text-white">
                        <span>📊 Score: <strong id="current-score">0</strong></span>
                        <span>❓ Question: <strong id="question-number">1</strong>/${this.questions.length}</span>
                        <span>💡 Hints: <strong id="hints-used">0</strong></span>
                    </div>
                </div>

                <div class="question-card bg-dark p-4 rounded mb-4">
                    <h4 class="text-white mb-4" id="question-text"></h4>
                    
                    <div class="answers-grid mb-4" id="answers-container"></div>

                    <div class="game-controls d-flex gap-2 justify-content-center">
                        <button class="btn btn-warning" id="hint-btn">
                            <i class="fas fa-lightbulb"></i> Show Hint (-${this.hintPenalty} pts)
                        </button>
                        <button class="btn btn-info" id="reveal-btn">
                            <i class="fas fa-eye"></i> Reveal Answer (Skip)
                        </button>
                        <button class="btn btn-secondary" id="skip-btn">
                            <i class="fas fa-forward"></i> Skip Question
                        </button>
                    </div>

                    <div class="hint-box mt-3" id="hint-box" style="display: none;">
                        <div class="alert alert-warning">
                            <i class="fas fa-lightbulb me-2"></i><strong>Hint:</strong> <span id="hint-text"></span>
                        </div>
                    </div>

                    <div class="explanation-box mt-3" id="explanation-box" style="display: none;">
                        <div class="alert alert-info">
                            <i class="fas fa-graduation-cap me-2"></i><strong>Explanation:</strong> <span id="explanation-text"></span>
                        </div>
                    </div>
                </div>

                <div class="progress mb-3">
                    <div class="progress-bar bg-success progress-bar-striped progress-bar-animated" 
                         id="progress-bar" 
                         style="width: 0%">
                    </div>
                </div>
            </div>
        `;

        // Setup event listeners
        document.getElementById('hint-btn').addEventListener('click', () => this.showHint());
        document.getElementById('reveal-btn').addEventListener('click', () => this.revealAnswer());
        document.getElementById('skip-btn').addEventListener('click', () => this.skipQuestion());

        this.showQuestion();
    }

    showQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.endGame();
            return;
        }

        const q = this.questions[this.currentQuestionIndex];
        
        // Update UI
        document.getElementById('question-text').textContent = q.question;
        document.getElementById('question-number').textContent = this.currentQuestionIndex + 1;
        document.getElementById('current-score').textContent = this.score;
        document.getElementById('hints-used').textContent = this.hintsUsed;

        // Hide hint and explanation
        document.getElementById('hint-box').style.display = 'none';
        document.getElementById('explanation-box').style.display = 'none';

        // Update progress bar
        const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
        document.getElementById('progress-bar').style.width = progress + '%';

        // Create answer buttons
        const answersContainer = document.getElementById('answers-container');
        answersContainer.innerHTML = '';

        q.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-outline-light btn-lg w-100 mb-2 answer-btn';
            btn.innerHTML = `<strong>${String.fromCharCode(65 + index)})</strong> ${option}`;
            btn.dataset.index = index;
            btn.addEventListener('click', () => this.checkAnswer(index));
            answersContainer.appendChild(btn);
        });
    }

    showHint() {
        const q = this.questions[this.currentQuestionIndex];
        const hintBox = document.getElementById('hint-box');
        const hintText = document.getElementById('hint-text');

        hintText.textContent = q.hint;
        hintBox.style.display = 'block';

        this.hintsUsed++;
        this.score = Math.max(0, this.score - this.hintPenalty);
        
        document.getElementById('hints-used').textContent = this.hintsUsed;
        document.getElementById('current-score').textContent = this.score;
        document.getElementById('hint-btn').disabled = true;

        this.showNotification(`💡 Hint revealed! -${this.hintPenalty} points`, 'info');
    }

    revealAnswer() {
        const q = this.questions[this.currentQuestionIndex];
        const buttons = document.querySelectorAll('.answer-btn');
        
        buttons.forEach((btn, index) => {
            btn.disabled = true;
            if (index === q.correct) {
                btn.className = 'btn btn-success btn-lg w-100 mb-2 answer-btn';
                btn.innerHTML = `<i class="fas fa-check-circle me-2"></i>${btn.innerHTML}`;
            }
        });

        // Show explanation
        const explanationBox = document.getElementById('explanation-box');
        const explanationText = document.getElementById('explanation-text');
        explanationText.textContent = q.explanation;
        explanationBox.style.display = 'block';

        // Disable controls
        document.getElementById('hint-btn').disabled = true;
        document.getElementById('reveal-btn').disabled = true;
        document.getElementById('skip-btn').disabled = true;

        this.showNotification('📖 Answer revealed! Study the explanation.', 'info');

        setTimeout(() => this.nextQuestion(), 4000);
    }

    skipQuestion() {
        this.showNotification('⏭️ Question skipped!', 'warning');
        this.nextQuestion();
    }

    checkAnswer(selected) {
        const q = this.questions[this.currentQuestionIndex];
        const buttons = document.querySelectorAll('.answer-btn');
        
        // Disable all buttons
        buttons.forEach(btn => btn.disabled = true);
        document.getElementById('hint-btn').disabled = true;
        document.getElementById('reveal-btn').disabled = true;
        document.getElementById('skip-btn').disabled = true;

        if (selected === q.correct) {
            // Correct answer
            buttons[selected].className = 'btn btn-success btn-lg w-100 mb-2 answer-btn';
            buttons[selected].innerHTML = `<i class="fas fa-check-circle me-2"></i>${buttons[selected].innerHTML}`;
            
            this.score += 100;
            this.showNotification('✅ Correct! +100 points!', 'success');
            
            // Celebration animation
            this.playSuccessAnimation();
        } else {
            // Wrong answer
            buttons[selected].className = 'btn btn-danger btn-lg w-100 mb-2 answer-btn';
            buttons[selected].innerHTML = `<i class="fas fa-times-circle me-2"></i>${buttons[selected].innerHTML}`;
            buttons[q.correct].className = 'btn btn-success btn-lg w-100 mb-2 answer-btn';
            buttons[q.correct].innerHTML = `<i class="fas fa-check-circle me-2"></i>${buttons[q.correct].innerHTML}`;
            
            this.showNotification('❌ Incorrect! Correct answer highlighted.', 'danger');
        }

        // Show explanation
        const explanationBox = document.getElementById('explanation-box');
        const explanationText = document.getElementById('explanation-text');
        explanationText.textContent = q.explanation;
        explanationBox.style.display = 'block';

        document.getElementById('current-score').textContent = this.score;

        setTimeout(() => this.nextQuestion(), 3000);
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        this.showQuestion();
    }

    endGame() {
        const gameBoard = document.getElementById('game-board');
        const percentage = (this.score / (this.questions.length * 100)) * 100;
        
        let grade, message, emoji;
        if (percentage === 100) {
            grade = 'S';
            message = 'Perfect Score!';
            emoji = '🏆';
        } else if (percentage >= 90) {
            grade = 'A+';
            message = 'Outstanding!';
            emoji = '⭐';
        } else if (percentage >= 80) {
            grade = 'A';
            message = 'Excellent!';
            emoji = '🎉';
        } else if (percentage >= 70) {
            grade = 'B';
            message = 'Good Job!';
            emoji = '👍';
        } else if (percentage >= 60) {
            grade = 'C';
            message = 'Not Bad!';
            emoji = '📚';
        } else {
            grade = 'D';
            message = 'Keep Practicing!';
            emoji = '💪';
        }

        gameBoard.innerHTML = `
            <div class="game-over text-center text-white p-4">
                <div class="display-1 mb-3">${emoji}</div>
                <h2 class="mb-4">Game Complete!</h2>
                
                <div class="score-card bg-dark p-4 rounded mb-4">
                    <div class="display-2 mb-3">${grade}</div>
                    <h3 class="mb-3">${message}</h3>
                    <div class="row text-center mb-3">
                        <div class="col-4">
                            <div class="stat-box">
                                <div class="h1">${this.score}</div>
                                <div class="text-muted">Final Score</div>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="stat-box">
                                <div class="h1">${percentage.toFixed(0)}%</div>
                                <div class="text-muted">Accuracy</div>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="stat-box">
                                <div class="h1">${this.hintsUsed}</div>
                                <div class="text-muted">Hints Used</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="d-flex gap-3 justify-content-center">
                    <button class="btn btn-primary btn-lg" onclick="window.gameEngine.resetToGameSelection()">
                        <i class="fas fa-redo me-2"></i>Play Again
                    </button>
                    <button class="btn btn-success btn-lg" onclick="window.gameEngine.returnToGameSelection()">
                        <i class="fas fa-home me-2"></i>Back to Game Selection
                    </button>
                </div>
            </div>
        `;

        this.showNotification(`🎮 Game Over! Score: ${this.score} | Grade: ${grade}`, 'success');
    }

    playSuccessAnimation() {
        // Confetti or particle effect
        const colors = ['#667eea', '#764ba2', '#FFD700', '#00d4ff'];
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: fixed;
                    width: 10px;
                    height: 10px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    border-radius: 50%;
                    top: 50%;
                    left: 50%;
                    pointer-events: none;
                    z-index: 9999;
                    animation: explode 1s ease-out forwards;
                `;
                document.body.appendChild(particle);
                setTimeout(() => particle.remove(), 1000);
            }, i * 50);
        }
    }

    showNotification(message, type) {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }

    // ✅ Return to game selection screen
    returnToGameSelection() {
        const gameStart = document.getElementById('game-start');
        const gameBoard = document.getElementById('game-board');
        
        if (gameBoard) gameBoard.innerHTML = '';
        if (gameStart) {
            gameStart.style.display = 'block';
            gameStart.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Reset game state
        this.currentGame = null;
        this.score = 0;
        this.hintsUsed = 0;
        this.currentQuestionIndex = 0;
        this.questions = [];
        
        this.showNotification('🎮 Returned to game selection!', 'info');
    }

    // ✅ Play the same game again
    resetToGameSelection() {
        const currentGameType = this.currentGame;
        this.returnToGameSelection();
        
        // Automatically restart the same game
        setTimeout(() => {
            if (currentGameType === 'api-quiz') this.startAPIQuiz();
            else if (currentGameType === 'debug-game') this.startDebugGame();
            else if (currentGameType === 'syntax-game') this.startSyntaxGame();
        }, 500);
    }
}

// Add explosion animation
const style = document.createElement('style');
style.textContent = `
    @keyframes explode {
        0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(
                ${Math.random() * 200 - 100}px,
                ${Math.random() * 200 - 100}px
            ) scale(0);
            opacity: 0;
        }
    }

    .answer-btn {
        transition: all 0.3s ease;
        position: relative;
    }

    .answer-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    .answers-grid {
        display: grid;
        gap: 10px;
    }

    .stat-box {
        padding: 15px;
        background: rgba(255,255,255,0.1);
        border-radius: 10px;
    }
`;
document.head.appendChild(style);

// Global instance
window.gameEngine = new EnhancedGameEngine();

// Export functions for compatibility
window.startEnhancedAPIQuiz = () => window.gameEngine.startAPIQuiz();
window.startEnhancedDebugGame = () => window.gameEngine.startDebugGame();
window.startEnhancedSyntaxGame = () => window.gameEngine.startSyntaxGame();

console.log('✅ Enhanced Game Engine Loaded!');
