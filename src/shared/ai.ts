/**
 * AI Module - Computer opponent logic
 *
 * Contains AI implementations for single-player mode.
 * Each difficulty level uses a different strategy:
 * - Easy: Random moves
 * - Medium: Mix of random and optimal
 * - Hard: Minimax algorithm (unbeatable)
 */

import { Board, Player, Position } from './types';
import { applyMoveToBoard, checkWin, getAvailableMoves, getOpponent, isBoardFull } from './game';

/**
 * Easy AI: Picks a completely random move from available positions.
 *
 * Strategy: No strategy! Just randomness.
 * This makes for a very beatable opponent, good for beginners.
 *
 * @param board - Current board state
 * @returns A random valid position, or null if no moves available
 */
export function getRandomMove(board: Board): Position | null {
  const availableMoves = getAvailableMoves(board);

  if (availableMoves.length === 0) {
    return null;
  }

  // Pick a random index from available moves
  const randomIndex = Math.floor(Math.random() * availableMoves.length);
  return availableMoves[randomIndex];
}

/**
 * Easy AI wrapper that returns a move for the AI player.
 * Uses pure random selection.
 *
 * @param board - Current board state
 * @returns The chosen position, or null if no moves available
 */
export function getEasyAIMove(board: Board): Position | null {
  return getRandomMove(board);
}

// ============================================
// Hard AI: Minimax with Alpha-Beta Pruning
// ============================================

/**
 * Scores for minimax evaluation.
 * Higher is better for the maximizing player.
 */
const SCORES = {
  WIN: 10,
  LOSE: -10,
  DRAW: 0,
};

/**
 * Minimax algorithm with alpha-beta pruning.
 *
 * How it works:
 * 1. Recursively simulate all possible game outcomes
 * 2. "Maximizing" player tries to get highest score (AI)
 * 3. "Minimizing" player tries to get lowest score (opponent)
 * 4. Alpha-beta pruning skips branches that won't affect the result
 *
 * @param board - Current board state
 * @param depth - How deep in the game tree (for preferring quicker wins)
 * @param isMaximizing - True if it's the AI's turn (maximize), false for opponent (minimize)
 * @param aiPlayer - The AI's player symbol
 * @param alpha - Best score the maximizer can guarantee (for pruning)
 * @param beta - Best score the minimizer can guarantee (for pruning)
 * @returns The score of the best move from this position
 */
function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  aiPlayer: Player,
  alpha: number,
  beta: number
): number {
  // Terminal state checks
  const winResult = checkWin(board);
  if (winResult) {
    // Subtract depth so AI prefers winning sooner
    const score = winResult.winner === aiPlayer ? SCORES.WIN - depth : SCORES.LOSE + depth;
    return score;
  }

  if (isBoardFull(board)) {
    return SCORES.DRAW;
  }

  const availableMoves = getAvailableMoves(board);
  const currentPlayer = isMaximizing ? aiPlayer : getOpponent(aiPlayer);

  if (isMaximizing) {
    // AI's turn: maximize score
    let maxScore = -Infinity;

    for (const move of availableMoves) {
      const newBoard = applyMoveToBoard(board, move, currentPlayer);
      const score = minimax(newBoard, depth + 1, false, aiPlayer, alpha, beta);
      maxScore = Math.max(maxScore, score);

      // Alpha-beta pruning
      alpha = Math.max(alpha, score);
      if (beta <= alpha) {
        break; // Beta cutoff - opponent won't allow this path
      }
    }

    return maxScore;
  } else {
    // Opponent's turn: minimize score
    let minScore = Infinity;

    for (const move of availableMoves) {
      const newBoard = applyMoveToBoard(board, move, currentPlayer);
      const score = minimax(newBoard, depth + 1, true, aiPlayer, alpha, beta);
      minScore = Math.min(minScore, score);

      // Alpha-beta pruning
      beta = Math.min(beta, score);
      if (beta <= alpha) {
        break; // Alpha cutoff - AI won't choose this path
      }
    }

    return minScore;
  }
}

/**
 * Hard AI: Uses minimax algorithm to find the optimal move.
 * This AI is unbeatable - the best you can do is draw.
 *
 * @param board - Current board state
 * @param aiPlayer - The AI's player symbol (X or O)
 * @returns The optimal position to play, or null if no moves available
 */
export function getHardAIMove(board: Board, aiPlayer: Player): Position | null {
  const availableMoves = getAvailableMoves(board);

  if (availableMoves.length === 0) {
    return null;
  }

  let bestMove: Position | null = null;
  let bestScore = -Infinity;

  for (const move of availableMoves) {
    const newBoard = applyMoveToBoard(board, move, aiPlayer);
    // Start minimax with opponent's turn (minimizing)
    const score = minimax(newBoard, 0, false, aiPlayer, -Infinity, Infinity);

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
