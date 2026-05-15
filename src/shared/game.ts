/**
 * Game Logic Module
 *
 * Contains pure functions for game state management.
 * These functions have no side effects - they take input and return output
 * without modifying anything. This makes them easy to test and reason about.
 */

import { Board, GameState, GameStatus, Move, Player, Position, Score } from './types';

/**
 * All possible winning lines in Tic-Tac-Toe.
 *
 * Board positions:
 *   0 | 1 | 2
 *   ---------
 *   3 | 4 | 5
 *   ---------
 *   6 | 7 | 8
 *
 * Winning combinations:
 * - Rows: [0,1,2], [3,4,5], [6,7,8]
 * - Columns: [0,3,6], [1,4,7], [2,5,8]
 * - Diagonals: [0,4,8], [2,4,6]
 */
const WINNING_LINES: [Position, Position, Position][] = [
  // Rows (horizontal)
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Columns (vertical)
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6],
];

/**
 * Row indices for win checking.
 */
const ROW_LINES: [Position, Position, Position][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
];

/**
 * Column indices for win checking.
 */
const COLUMN_LINES: [Position, Position, Position][] = [
  [0, 3, 6], // left column
  [1, 4, 7], // middle column
  [2, 5, 8], // right column
];

/**
 * Diagonal indices for win checking.
 */
const DIAGONAL_LINES: [Position, Position, Position][] = [
  [0, 4, 8], // top-left to bottom-right
  [2, 4, 6], // top-right to bottom-left
];

/**
 * Creates an empty 3x3 board.
 * All cells are initialized to null (empty).
 */
export function createEmptyBoard(): Board {
  return [null, null, null, null, null, null, null, null, null];
}

/**
 * Creates the initial game state for a new game.
 * X always goes first in Tic-Tac-Toe (traditional rule).
 */
export function createInitialGameState(): GameState {
  return {
    board: createEmptyBoard(),
    status: { state: 'playing', currentPlayer: 'X' },
    moveHistory: [],
  };
}

/**
 * Creates initial score (all zeros).
 */
export function createInitialScore(): Score {
  return {
    X: 0,
    O: 0,
    draws: 0,
  };
}

/**
 * Gets the opponent of a given player.
 */
export function getOpponent(player: Player): Player {
  return player === 'X' ? 'O' : 'X';
}

/**
 * Checks if the game is still in progress.
 */
export function isGameInProgress(status: GameStatus): boolean {
  return status.state === 'playing';
}

/**
 * Checks if a position is valid (0-8).
 */
export function isValidPosition(position: number): position is Position {
  return Number.isInteger(position) && position >= 0 && position <= 8;
}

/**
 * Checks if a cell is empty (can be played on).
 */
export function isCellEmpty(board: Board, position: Position): boolean {
  return board[position] === null;
}

/**
 * Validates whether a move is legal.
 * A move is legal if:
 * 1. The game is still in progress
 * 2. The position is valid (0-8)
 * 3. The cell is empty
 * 4. It's the correct player's turn
 */
export function isValidMove(gameState: GameState, position: number, player: Player): boolean {
  // Game must be in progress
  if (!isGameInProgress(gameState.status)) {
    return false;
  }

  // Position must be valid
  if (!isValidPosition(position)) {
    return false;
  }

  // Cell must be empty
  if (!isCellEmpty(gameState.board, position)) {
    return false;
  }

  // Must be this player's turn
  if (gameState.status.state === 'playing' && gameState.status.currentPlayer !== player) {
    return false;
  }

  return true;
}

/**
 * Gets all empty positions on the board (available moves).
 */
export function getAvailableMoves(board: Board): Position[] {
  const moves: Position[] = [];
  for (let i = 0; i <= 8; i++) {
    if (isValidPosition(i) && isCellEmpty(board, i)) {
      moves.push(i);
    }
  }
  return moves;
}

/**
 * Creates a new board with a move applied.
 * Does NOT mutate the original board - returns a new array.
 *
 * Immutability concept: Instead of modifying the existing board,
 * we create a copy with the change. This makes it easier to:
 * - Track history (undo/redo)
 * - Debug (previous states are preserved)
 * - Reason about code (no hidden side effects)
 */
export function applyMoveToBoard(board: Board, position: Position, player: Player): Board {
  const newBoard = [...board] as Board;
  newBoard[position] = player;
  return newBoard;
}

/**
 * Executes a move and returns a new game state.
 * This is a "pure" function - it doesn't modify the input, it returns new output.
 *
 * Note: This version doesn't check for wins yet (that's the next story).
 * For now, it just switches to the next player.
 *
 * @param gameState - Current game state
 * @param position - Where to place the mark
 * @returns New game state with the move applied, or null if move is invalid
 */
export function makeMove(gameState: GameState, position: Position): GameState | null {
  // Get current player from status
  if (gameState.status.state !== 'playing') {
    return null;
  }

  const currentPlayer = gameState.status.currentPlayer;

  // Validate the move
  if (!isValidMove(gameState, position, currentPlayer)) {
    return null;
  }

  // Apply move to board
  const newBoard = applyMoveToBoard(gameState.board, position, currentPlayer);

  // Create the move record
  const move: Move = {
    player: currentPlayer,
    position: position,
  };

  // Determine new game status (check for win/draw)
  const nextPlayer = getOpponent(currentPlayer);
  const newStatus = getGameStatus(newBoard, nextPlayer);

  // Return new game state
  return {
    board: newBoard,
    status: newStatus,
    moveHistory: [...gameState.moveHistory, move],
  };
}

// ============================================
// Win Detection Functions
// ============================================

/**
 * Checks if a specific line (3 positions) is a win for any player.
 * Returns the winning player if all three cells match, null otherwise.
 */
export function checkLine(board: Board, line: [Position, Position, Position]): Player | null {
  const [a, b, c] = line;
  const cellA = board[a];
  const cellB = board[b];
  const cellC = board[c];

  // All three must be the same and not empty
  if (cellA !== null && cellA === cellB && cellB === cellC) {
    return cellA;
  }
  return null;
}

/**
 * Checks for a win in any of the three rows (horizontal lines).
 *
 * Rows:
 *   [0, 1, 2] - top row
 *   [3, 4, 5] - middle row
 *   [6, 7, 8] - bottom row
 */
export function checkRowWin(
  board: Board
): { winner: Player; line: [Position, Position, Position] } | null {
  for (const line of ROW_LINES) {
    const winner = checkLine(board, line);
    if (winner) {
      return { winner, line };
    }
  }
  return null;
}

/**
 * Checks for a win in any of the three columns (vertical lines).
 *
 * Columns:
 *   [0, 3, 6] - left column
 *   [1, 4, 7] - middle column
 *   [2, 5, 8] - right column
 */
export function checkColumnWin(
  board: Board
): { winner: Player; line: [Position, Position, Position] } | null {
  for (const line of COLUMN_LINES) {
    const winner = checkLine(board, line);
    if (winner) {
      return { winner, line };
    }
  }
  return null;
}

/**
 * Checks for a win in either diagonal.
 *
 * Diagonals:
 *   [0, 4, 8] - top-left to bottom-right (\)
 *   [2, 4, 6] - top-right to bottom-left (/)
 */
export function checkDiagonalWin(
  board: Board
): { winner: Player; line: [Position, Position, Position] } | null {
  for (const line of DIAGONAL_LINES) {
    const winner = checkLine(board, line);
    if (winner) {
      return { winner, line };
    }
  }
  return null;
}

/**
 * Checks if the board is full (no empty cells remaining).
 * A full board with no winner means the game is a draw.
 */
export function isBoardFull(board: Board): boolean {
  return board.every((cell) => cell !== null);
}

/**
 * Checks if the game is a draw.
 * A draw occurs when the board is full and there is no winner.
 */
export function isDraw(board: Board): boolean {
  // If board isn't full, can't be a draw yet
  if (!isBoardFull(board)) {
    return false;
  }

  // Check if there's a winner - if so, not a draw
  const rowWin = checkRowWin(board);
  const colWin = checkColumnWin(board);
  const diagWin = checkDiagonalWin(board);

  return rowWin === null && colWin === null && diagWin === null;
}

/**
 * Checks for any win on the board (rows, columns, or diagonals).
 * Returns the winner and winning line, or null if no winner yet.
 */
export function checkWin(
  board: Board
): { winner: Player; winningLine: [Position, Position, Position] } | null {
  // Check rows
  const rowWin = checkRowWin(board);
  if (rowWin) {
    return { winner: rowWin.winner, winningLine: rowWin.line };
  }

  // Check columns
  const colWin = checkColumnWin(board);
  if (colWin) {
    return { winner: colWin.winner, winningLine: colWin.line };
  }

  // Check diagonals
  const diagWin = checkDiagonalWin(board);
  if (diagWin) {
    return { winner: diagWin.winner, winningLine: diagWin.line };
  }

  return null;
}

/**
 * Determines the current game status based on the board state.
 * This is the unified status checker that combines all win/draw detection.
 *
 * @param board - Current board state
 * @param currentPlayer - The player whose turn it would be if game continues
 * @returns GameStatus indicating playing, won, or draw
 */
export function getGameStatus(board: Board, currentPlayer: Player): GameStatus {
  // Check for a winner first
  const winResult = checkWin(board);
  if (winResult) {
    return {
      state: 'won',
      winner: winResult.winner,
      winningLine: winResult.winningLine,
    };
  }

  // Check for draw (board full, no winner)
  if (isBoardFull(board)) {
    return { state: 'draw' };
  }

  // Game is still in progress
  return { state: 'playing', currentPlayer };
}
