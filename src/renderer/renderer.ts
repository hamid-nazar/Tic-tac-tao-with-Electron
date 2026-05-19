/**
 * Renderer Process - Game UI Logic
 *
 * This runs in the browser context (Chromium).
 * It handles:
 * - DOM manipulation (updating the UI)
 * - User interactions (click handlers)
 * - Game state management for the UI
 *
 * Note: This file has NO access to Node.js APIs directly.
 * Communication with main process goes through window.electronAPI (preload script).
 */

import { GameState, GameSettings, Score, Position, Difficulty, GameMode } from '../shared/types';
import { createInitialGameState, createInitialScore, makeMove } from '../shared/game';
import { getAIMove } from '../shared/ai';

// ============================================
// DOM Element References
// ============================================

const boardElement = document.getElementById('board') as HTMLElement;
const statusTextElement = document.getElementById('status-text') as HTMLElement;
const statusElement = document.getElementById('status') as HTMLElement;
const newGameButton = document.getElementById('new-game-btn') as HTMLButtonElement;
const modeIndicator = document.getElementById('mode-indicator') as HTMLElement;
const scoreXElement = document.getElementById('score-x') as HTMLElement;
const scoreOElement = document.getElementById('score-o') as HTMLElement;
const scoreDrawsElement = document.getElementById('score-draws') as HTMLElement;

// Settings panel elements
const playerRadios = document.querySelectorAll(
  'input[name="player"]'
) as NodeListOf<HTMLInputElement>;
const difficultyRadios = document.querySelectorAll(
  'input[name="difficulty"]'
) as NodeListOf<HTMLInputElement>;
const modeRadios = document.querySelectorAll('input[name="mode"]') as NodeListOf<HTMLInputElement>;

// ============================================
// Game State
// ============================================

let gameState: GameState = createInitialGameState();
const score: Score = createInitialScore();
const settings: GameSettings = {
  mode: 'single',
  difficulty: 'medium',
  humanPlayer: 'X',
};

// ============================================
// Audio - Web Audio API for sound effects
// ============================================

/**
 * Web Audio API context (created lazily on first user interaction).
 * Browsers require user interaction before playing audio.
 */
let audioContext: AudioContext | null = null;

/**
 * Gets or creates the AudioContext.
 * Lazy initialization ensures we only create it after user interaction.
 */
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

/**
 * Plays a short "pop" sound when placing a marker.
 * Uses Web Audio API to generate a synthetic sound - no external files needed.
 */
function playMoveSound(): void {
  const ctx = getAudioContext();

  // Create oscillator for the tone
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  // Connect: oscillator -> gain -> output
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Configure sound: short "pop" at 600Hz
  oscillator.frequency.value = 600;
  oscillator.type = 'sine';

  // Quick fade out for a clean "pop" sound
  const now = ctx.currentTime;
  gainNode.gain.setValueAtTime(0.3, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  // Play for 100ms
  oscillator.start(now);
  oscillator.stop(now + 0.1);
}

// ============================================
// Rendering Functions
// ============================================

/**
 * Renders the game board based on current game state.
 * Updates each cell to show X, O, or empty.
 */
function renderBoard(): void {
  const cells = boardElement.querySelectorAll('.cell');

  cells.forEach((cell, index) => {
    const cellElement = cell as HTMLButtonElement;
    const cellValue = gameState.board[index as Position];

    // Clear previous state
    cellElement.textContent = '';
    cellElement.removeAttribute('data-player');
    cellElement.classList.remove('winning');
    cellElement.disabled = false;

    if (cellValue) {
      // Cell has a player mark
      cellElement.textContent = cellValue;
      cellElement.setAttribute('data-player', cellValue);
      cellElement.disabled = true;
    }

    // Disable all cells if game is over
    if (gameState.status.state !== 'playing') {
      cellElement.disabled = true;
    }
  });

  // Highlight winning cells
  if (gameState.status.state === 'won') {
    const winningLine = gameState.status.winningLine;
    winningLine.forEach((position) => {
      const cell = cells[position] as HTMLButtonElement;
      cell.classList.add('winning');
    });
  }
}

/**
 * Updates the status text based on game state.
 */
function renderStatus(): void {
  statusElement.classList.remove('winner', 'draw');

  switch (gameState.status.state) {
    case 'playing':
      const currentPlayer = gameState.status.currentPlayer;
      if (settings.mode === 'single' && currentPlayer !== settings.humanPlayer) {
        statusTextElement.textContent = 'AI is thinking...';
      } else {
        statusTextElement.textContent = `${currentPlayer}'s turn`;
      }
      break;

    case 'won':
      statusTextElement.textContent = `${gameState.status.winner} wins!`;
      statusElement.classList.add('winner');
      break;

    case 'draw':
      statusTextElement.textContent = "It's a draw!";
      statusElement.classList.add('draw');
      break;
  }
}

/**
 * Updates the scoreboard display.
 */
function renderScore(): void {
  scoreXElement.textContent = score.X.toString();
  scoreOElement.textContent = score.O.toString();
  scoreDrawsElement.textContent = score.draws.toString();
}

/**
 * Updates the mode indicator text.
 */
function renderModeIndicator(): void {
  if (settings.mode === 'single') {
    const difficultyText =
      settings.difficulty.charAt(0).toUpperCase() + settings.difficulty.slice(1);
    modeIndicator.textContent = `Single Player (${difficultyText})`;
  } else {
    modeIndicator.textContent = 'Two Player';
  }
}

/**
 * Main render function - updates all UI elements.
 */
function render(): void {
  renderBoard();
  renderStatus();
  renderScore();
  renderModeIndicator();
}

// ============================================
// Game Logic
// ============================================

/**
 * Handles a cell click (human move).
 */
function handleCellClick(position: Position): void {
  // Ignore clicks if game is over
  if (gameState.status.state !== 'playing') {
    return;
  }

  // In single player mode, ignore clicks when it's AI's turn
  if (settings.mode === 'single') {
    const currentPlayer = gameState.status.currentPlayer;
    if (currentPlayer !== settings.humanPlayer) {
      return;
    }
  }

  // Try to make the move
  const newState = makeMove(gameState, position);
  if (newState) {
    gameState = newState;
    playMoveSound();
    render();

    // Check if game ended
    if (gameState.status.state !== 'playing') {
      handleGameEnd();
      return;
    }

    // In single player mode, trigger AI move
    if (settings.mode === 'single') {
      setTimeout(makeAIMove, 500); // Small delay for better UX
    }
  }
}

/**
 * Makes the AI move.
 */
function makeAIMove(): void {
  if (gameState.status.state !== 'playing') {
    return;
  }

  const aiPlayer = settings.humanPlayer === 'X' ? 'O' : 'X';
  const aiMove = getAIMove(gameState.board, aiPlayer, settings.difficulty);

  if (aiMove !== null) {
    const newState = makeMove(gameState, aiMove);
    if (newState) {
      gameState = newState;
      playMoveSound();
      render();

      if (gameState.status.state !== 'playing') {
        handleGameEnd();
      }
    }
  }
}

/**
 * Handles the end of a game (updates score).
 */
function handleGameEnd(): void {
  if (gameState.status.state === 'won') {
    const winner = gameState.status.winner;
    score[winner]++;
  } else if (gameState.status.state === 'draw') {
    score.draws++;
  }
  renderScore();
}

/**
 * Starts a new game.
 * Animates the board clearing before resetting state.
 */
function startNewGame(): void {
  const cells = boardElement.querySelectorAll('.cell');
  const hasContent = Array.from(cells).some((cell) => cell.textContent !== '');

  if (hasContent) {
    // Add resetting animation to cells with content
    cells.forEach((cell) => {
      if (cell.textContent !== '') {
        cell.classList.add('resetting');
      }
    });

    // Wait for animation to complete, then reset
    setTimeout(() => {
      cells.forEach((cell) => cell.classList.remove('resetting'));
      gameState = createInitialGameState();
      render();

      // If AI goes first in single player mode
      if (settings.mode === 'single' && settings.humanPlayer === 'O') {
        setTimeout(makeAIMove, 500);
      }
    }, 200);
  } else {
    // No content to animate, just reset immediately
    gameState = createInitialGameState();
    render();

    if (settings.mode === 'single' && settings.humanPlayer === 'O') {
      setTimeout(makeAIMove, 500);
    }
  }
}

/**
 * Changes the game mode.
 */
function setGameMode(mode: GameMode): void {
  settings.mode = mode;
  startNewGame();
}

/**
 * Changes the AI difficulty.
 */
function setDifficulty(difficulty: Difficulty): void {
  settings.difficulty = difficulty;
  renderModeIndicator();
}

/**
 * Changes which player the human controls.
 * In single player mode, this determines if the human goes first (X) or second (O).
 */
function setHumanPlayer(player: 'X' | 'O'): void {
  settings.humanPlayer = player;
  startNewGame(); // Restart game when player choice changes
}

// ============================================
// Event Listeners
// ============================================

// Cell click handlers
boardElement.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  if (target.classList.contains('cell')) {
    const index = parseInt(target.getAttribute('data-index') || '-1', 10);
    if (index >= 0 && index <= 8) {
      handleCellClick(index as Position);
    }
  }
});

// New game button
newGameButton.addEventListener('click', startNewGame);

// Listen for menu commands from main process
if (window.electronAPI) {
  // These would be set up via IPC from the menu
  // For now, we'll add keyboard shortcuts as backup
}

// Player selection (X or O)
playerRadios.forEach((radio) => {
  radio.addEventListener('change', () => {
    if (radio.checked) {
      setHumanPlayer(radio.value as 'X' | 'O');
    }
  });
});

// Difficulty selection (easy, medium, hard)
difficultyRadios.forEach((radio) => {
  radio.addEventListener('change', () => {
    if (radio.checked) {
      setDifficulty(radio.value as Difficulty);
    }
  });
});

// Game mode selection (single player vs two player)
modeRadios.forEach((radio) => {
  radio.addEventListener('change', () => {
    if (radio.checked) {
      setGameMode(radio.value as GameMode);
    }
  });
});

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
  // Cmd/Ctrl + N = New Game
  if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
    event.preventDefault();
    startNewGame();
  }

  // Cmd/Ctrl + 1 = Single Player
  if ((event.metaKey || event.ctrlKey) && event.key === '1') {
    event.preventDefault();
    setGameMode('single');
  }

  // Cmd/Ctrl + 2 = Two Player
  if ((event.metaKey || event.ctrlKey) && event.key === '2') {
    event.preventDefault();
    setGameMode('two-player');
  }
});

// ============================================
// Initialize
// ============================================

// Initial render
render();

// Export functions for menu integration
(window as unknown as Record<string, unknown>).gameAPI = {
  startNewGame,
  setGameMode,
  setDifficulty,
  setHumanPlayer,
};
