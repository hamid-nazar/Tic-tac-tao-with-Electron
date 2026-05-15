/**
 * Type declarations for the Electron API exposed via preload script.
 *
 * This extends the global Window interface to include our electronAPI.
 * Now TypeScript knows about window.electronAPI in renderer code.
 */

export interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  saveGame: (gameData: unknown) => Promise<void>;
  loadGame: () => Promise<unknown>;
  clearGame: () => Promise<void>;
  getPlatform: () => string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
