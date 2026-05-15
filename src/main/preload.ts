/**
 * Preload Script - Bridge between Main and Renderer processes
 *
 * Electron Security Model:
 * - Renderer process (browser) is sandboxed - no direct Node.js access
 * - Preload script runs in a special context with Node.js access
 * - contextBridge safely exposes specific APIs to the renderer
 *
 * This file defines the "API contract" between main and renderer.
 * The renderer can only call functions we explicitly expose here.
 */

import { contextBridge, ipcRenderer } from 'electron';
import { AppChannels, GameChannels } from '../shared/ipc-channels';

/**
 * API exposed to the renderer process.
 * Access via: window.electronAPI.methodName()
 */
const electronAPI = {
  /**
   * Get the app version from package.json
   */
  getAppVersion: (): Promise<string> => {
    return ipcRenderer.invoke(AppChannels.GET_VERSION);
  },

  /**
   * Game state persistence - save game to disk
   */
  saveGame: (gameData: unknown): Promise<void> => {
    return ipcRenderer.invoke(GameChannels.SAVE_GAME, gameData);
  },

  /**
   * Game state persistence - load game from disk
   */
  loadGame: (): Promise<unknown> => {
    return ipcRenderer.invoke(GameChannels.LOAD_GAME);
  },

  /**
   * Clear saved game data
   */
  clearGame: (): Promise<void> => {
    return ipcRenderer.invoke(GameChannels.CLEAR_GAME);
  },

  /**
   * Platform information
   */
  getPlatform: (): string => {
    return process.platform;
  },
};

// Expose the API to the renderer process
// The renderer can access this via window.electronAPI
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

/**
 * TypeScript type declaration for the exposed API.
 * This helps with type checking in the renderer.
 */
export type ElectronAPI = typeof electronAPI;
