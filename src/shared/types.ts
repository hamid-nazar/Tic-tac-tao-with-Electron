/**
 * Game Types and Interfaces
 *
 * These types are shared between main and renderer processes.
 * Defining them in src/shared/ allows both processes to use
 * the same type definitions, ensuring consistency.
 */

/**
 * Represents a player in the game.
 * In Tic-Tac-Toe, there are always exactly two players: X and O.
 */
export type Player = 'X' | 'O';

/**
 * Represents a single cell on the board.
 * Can be empty (null) or occupied by a player.
 */
export type Cell = Player | null;

/**
 * Represents the 3x3 game board.
 * Index mapping:
 *   0 | 1 | 2
 *   ---------
 *   3 | 4 | 5
 *   ---------
 *   6 | 7 | 8
 */
export type Board = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell];

/**
 * Valid positions on the board (0-8).
 */
export type Position = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * Represents a move made by a player.
 */
export interface Move {
  /** The player making the move */
  player: Player;
  /** The board position (0-8) */
  position: Position;
}

/**
 * Possible states the game can be in.
 */
export type GameStatus =
  | { state: 'playing'; currentPlayer: Player }
  | { state: 'won'; winner: Player; winningLine: [Position, Position, Position] }
  | { state: 'draw' };

/**
 * Complete game state at any point in time.
 */
export interface GameState {
  /** Current board configuration */
  board: Board;
  /** Current game status */
  status: GameStatus;
  /** History of all moves made */
  moveHistory: Move[];
}

/**
 * AI difficulty levels.
 */
export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * Game mode - single player (vs AI) or two player (local).
 */
export type GameMode = 'single' | 'two-player';

/**
 * Game settings/configuration.
 */
export interface GameSettings {
  /** Single player or two player mode */
  mode: GameMode;
  /** AI difficulty (only relevant in single player) */
  difficulty: Difficulty;
  /** Which player the human plays as in single player */
  humanPlayer: Player;
}

/**
 * Score tracking across multiple games.
 */
export interface Score {
  X: number;
  O: number;
  draws: number;
}
