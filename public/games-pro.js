/**
 * 🎮 BarodaTek Games Pro - All Games 100% Functional
 * Cleaned implementation for client-side game starters
 * Version: 2.0.0
 */

// Initialize game buttons and wire enhanced starters
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎮 Games Pro: Initializing...');

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
  try { if (typeof window.closeActiveGames === 'function') window.closeActiveGames(); } catch (e) { console.warn('closeActiveGames error', e); }

  const mapping = {
    'api-quiz': 'startEnhancedAPIQuiz',
    'API Galaxy': 'startEnhancedAPIQuiz',
    'debug-detective': 'startEnhancedDebugDetective',
    'Debug Detective': 'startEnhancedDebugDetective',
    'syntax-speed': 'startEnhancedSyntaxSpeed',
    'Syntax Speed': 'startEnhancedSyntaxSpeed',
    'algorithm-puzzle': 'startEnhancedAlgorithmPuzzle',
    'Algorithm Puzzle': 'startEnhancedAlgorithmPuzzle'
  };

  const fnName = mapping[gameType];
  if (!fnName) return alert('Game not found: ' + gameType);

  const fn = window[fnName];
  if (typeof fn === 'function') {
    try { fn(); } catch (err) { console.error(fnName + ' threw:', err); }
  } else {
    console.warn(fnName + ' not defined');
  }
}

// Expose globally
window.startEnhancedGame = startEnhancedGame;

console.log('✅ Games Pro module loaded');
          console.warn(fnName + ' not defined');
