/**
 * IPC Channel Definitions
 *
 * Centralized definitions for all IPC (Inter-Process Communication) channels.
 * Using constants prevents typos and makes refactoring easier.
 *
 * IPC in Electron:
 * - Main process listens with ipcMain.handle(channel, handler)
 * - Renderer calls with ipcRenderer.invoke(channel, ...args)
 * - invoke/handle is async and returns a Promise (request/response pattern)
 */

/**
 * IPC channels for app-level operations.
 */
export const AppChannels = {
  /** Get the application version from package.json */
  GET_VERSION: 'app:get-version',
} as const;

/**
 * IPC channels for game state operations.
 */
export const GameChannels = {
  /** Save game state to disk */
  SAVE_GAME: 'game:save',
  /** Load game state from disk */
  LOAD_GAME: 'game:load',
  /** Clear saved game */
  CLEAR_GAME: 'game:clear',
} as const;

/**
 * IPC channels for settings/preferences.
 */
export const SettingsChannels = {
  /** Get all settings */
  GET_SETTINGS: 'settings:get',
  /** Save settings */
  SAVE_SETTINGS: 'settings:save',
} as const;

/**
 * All IPC channels combined.
 * Use this for type checking channel names.
 */
export const IpcChannels = {
  ...AppChannels,
  ...GameChannels,
  ...SettingsChannels,
} as const;

/**
 * Type for all valid channel names.
 * Useful for type-safe channel handling.
 */
export type IpcChannel = (typeof IpcChannels)[keyof typeof IpcChannels];
