/**
 * Main Process - The entry point of the Electron application
 *
 * In Electron, the main process:
 * - Runs in Node.js (has access to file system, native APIs)
 * - Creates and manages BrowserWindows (the app windows)
 * - Handles app lifecycle (startup, quit, etc.)
 * - Cannot directly access the DOM (that's the renderer's job)
 */

import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { registerIpcHandlers } from './ipc-handlers';
import { createAppMenu, createDockMenu, setupAboutPanel } from './menu';

// Hot reload in development mode
// This watches for file changes and reloads/restarts appropriately
if (process.env.NODE_ENV !== 'production') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('electron-reload')(__dirname, {
      // When main process files change, restart the whole app
      electron: path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron'),
      // When renderer files change, just reload the window
      forceHardReset: true,
    });
  } catch (err) {
    console.error('Failed to load electron-reload:', err);
  }
}

/**
 * Window State Persistence
 *
 * Electron apps can remember window position and size between sessions.
 * We save this to a JSON file in the user's app data folder
 * (e.g., ~/Library/Application Support/tic-tac-tao/).
 */
interface WindowState {
  width: number;
  height: number;
  x?: number;
  y?: number;
  isMaximized?: boolean;
}

const DEFAULT_WINDOW_STATE: WindowState = {
  width: 600,
  height: 700,
};

/**
 * Gets the path to the window state file.
 */
function getWindowStatePath(): string {
  return path.join(app.getPath('userData'), 'window-state.json');
}

/**
 * Loads the saved window state from disk.
 */
function loadWindowState(): WindowState {
  try {
    const statePath = getWindowStatePath();
    if (fs.existsSync(statePath)) {
      const data = fs.readFileSync(statePath, 'utf-8');
      return { ...DEFAULT_WINDOW_STATE, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('Failed to load window state:', err);
  }
  return DEFAULT_WINDOW_STATE;
}

/**
 * Saves the window state to disk.
 */
function saveWindowState(state: WindowState): void {
  try {
    const statePath = getWindowStatePath();
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error('Failed to save window state:', err);
  }
}

// Keep a global reference to prevent garbage collection
let mainWindow: BrowserWindow | null = null;

/**
 * Captures and saves the current window state.
 */
function captureWindowState(): void {
  if (!mainWindow) return;

  const bounds = mainWindow.getBounds();
  const isMaximized = mainWindow.isMaximized();

  saveWindowState({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    isMaximized,
  });
}

function createWindow(): void {
  // Load saved window state
  const windowState = loadWindowState();

  // Create the browser window with saved state
  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    minWidth: 400,
    minHeight: 500,
    title: 'Tic-Tac-Toe',
    // Window appearance
    backgroundColor: '#1a1a2e',
    show: false, // Don't show until ready (prevents flash)
    webPreferences: {
      // Security: disable node integration in renderer
      nodeIntegration: false,
      // Security: enable context isolation
      contextIsolation: true,
      // Preload script for safe IPC communication
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Restore maximized state if it was maximized
  if (windowState.isMaximized) {
    mainWindow.maximize();
  }

  // Save window state when it changes
  mainWindow.on('resize', captureWindowState);
  mainWindow.on('move', captureWindowState);
  mainWindow.on('close', captureWindowState);

  // Load the game UI
  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  // Show window when ready (smoother experience)
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Open DevTools in development
  if (process.env.NODE_ENV !== 'production') {
    mainWindow.webContents.openDevTools();
  }

  // Clean up on close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Electron app lifecycle events

// App is ready - create the window
app.whenReady().then(() => {
  // Register IPC handlers before creating window
  registerIpcHandlers();

  // Configure the About panel (macOS)
  setupAboutPanel();

  // Create native application menu
  createAppMenu();

  // Create Dock menu (macOS only)
  createDockMenu();

  createWindow();

  // macOS: Re-create window when dock icon clicked and no windows exist
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  // On macOS, apps typically stay active until Cmd+Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
