/**
 * IPC Handlers - Main process handlers for renderer requests
 *
 * These handlers respond to ipcRenderer.invoke() calls from the renderer.
 * Each handler is registered with ipcMain.handle(channel, handler).
 *
 * The pattern is like a REST API:
 * - Renderer sends a request (invoke)
 * - Main process handles it and returns a response
 * - Renderer receives the response as a Promise
 */

import { ipcMain, app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { AppChannels, GameChannels } from '../shared/ipc-channels';

/**
 * Gets the path to the game save file.
 */
function getGameSavePath(): string {
  return path.join(app.getPath('userData'), 'game-save.json');
}

/**
 * Registers all IPC handlers.
 * Call this once when the app starts.
 */
export function registerIpcHandlers(): void {
  // App version handler
  ipcMain.handle(AppChannels.GET_VERSION, () => {
    return app.getVersion();
  });

  // Save game handler
  ipcMain.handle(GameChannels.SAVE_GAME, (_event, gameData: unknown) => {
    try {
      const savePath = getGameSavePath();
      fs.writeFileSync(savePath, JSON.stringify(gameData, null, 2));
      return { success: true };
    } catch (error) {
      console.error('Failed to save game:', error);
      throw new Error('Failed to save game');
    }
  });

  // Load game handler
  ipcMain.handle(GameChannels.LOAD_GAME, () => {
    try {
      const savePath = getGameSavePath();
      if (fs.existsSync(savePath)) {
        const data = fs.readFileSync(savePath, 'utf-8');
        return JSON.parse(data);
      }
      return null; // No saved game
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  });

  // Clear game handler
  ipcMain.handle(GameChannels.CLEAR_GAME, () => {
    try {
      const savePath = getGameSavePath();
      if (fs.existsSync(savePath)) {
        fs.unlinkSync(savePath);
      }
      return { success: true };
    } catch (error) {
      console.error('Failed to clear game:', error);
      throw new Error('Failed to clear game');
    }
  });
}
