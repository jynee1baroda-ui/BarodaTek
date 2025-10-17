/**
 * 🎮 BarodaTek Games Pro - All Games 100% Functional
 * Complete implementation with Game Engine Pro integration
 * Version: 2.0.0
 */

// Update existing game buttons to use enhanced versions
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Games Pro: Initializing...');
    
    // Replace old game handlers with enhanced versions
    const gameButtons = document.querySelectorAll('[data-action="startGame"]');
    gameButtons.forEach(button => {
        const gameType = button.getAttribute('data-arg');
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            startEnhancedGame(gameType);
        });
    });
    
    console.log('🎮 Games Pro: Ready!');
});

/**
 * Start enhanced game based on type
 */
function startEnhancedGame(gameType) {
    switch(gameType) {
        case 'api-quiz':
        case 'API Galaxy':
            startEnhancedAPIQuiz();
            break;
        case 'debug-detective':
        case 'Debug Detective':
            startEnhancedDebugDetective();
            break;
        case 'syntax-speed':
        case 'Syntax Speed':
            startEnhancedSyntaxSpeed();
            break;
        case 'algorithm-puzzle':
        case 'Algorithm Puzzle':
            startEnhancedAlgorithmPuzzle();
            break;
        default:
            alert('Game not found: ' + gameType);
    }
}

// Make globally accessible
window.startEnhancedGame = startEnhancedGame;

console.log('✅ Games Pro module loaded');
