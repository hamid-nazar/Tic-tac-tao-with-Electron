/**
 * Application Menu - Native macOS menu bar
 *
 * Electron creates native menus that integrate with the OS.
 * On macOS, the first menu is always the "app menu" (named after the app).
 *
 * Menu structure:
 * - App Menu (Tic-Tac-Toe): About, Preferences, Quit
 * - Game: New Game, difficulty options
 * - Edit: Standard copy/paste (required for text input)
 * - Window: Minimize, Close
 * - Help: Learn to Play
 */

import { Menu, shell, app, BrowserWindow, MenuItemConstructorOptions } from 'electron';

/**
 * Creates and sets the application menu.
 * Call this after the app is ready.
 */
export function createAppMenu(): void {
  const isMac = process.platform === 'darwin';

  const template: MenuItemConstructorOptions[] = [
    // App Menu (macOS only)
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              {
                label: 'Preferences...',
                accelerator: 'Cmd+,',
                click: (): void => {
                  // TODO: Open preferences window
                  const win = BrowserWindow.getFocusedWindow();
                  win?.webContents.send('open-preferences');
                },
              },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const },
            ],
          },
        ]
      : []),

    // Game Menu
    {
      label: 'Game',
      submenu: [
        {
          label: 'New Game',
          accelerator: 'CmdOrCtrl+N',
          click: (): void => {
            const win = BrowserWindow.getFocusedWindow();
            win?.webContents.send('new-game');
          },
        },
        { type: 'separator' },
        {
          label: 'Difficulty',
          submenu: [
            {
              label: 'Easy',
              type: 'radio',
              checked: true,
              click: (): void => {
                const win = BrowserWindow.getFocusedWindow();
                win?.webContents.send('set-difficulty', 'easy');
              },
            },
            {
              label: 'Medium',
              type: 'radio',
              click: (): void => {
                const win = BrowserWindow.getFocusedWindow();
                win?.webContents.send('set-difficulty', 'medium');
              },
            },
            {
              label: 'Hard',
              type: 'radio',
              click: (): void => {
                const win = BrowserWindow.getFocusedWindow();
                win?.webContents.send('set-difficulty', 'hard');
              },
            },
          ],
        },
        { type: 'separator' },
        {
          label: 'Two Player Mode',
          accelerator: 'CmdOrCtrl+2',
          click: (): void => {
            const win = BrowserWindow.getFocusedWindow();
            win?.webContents.send('set-mode', 'two-player');
          },
        },
        {
          label: 'Single Player Mode',
          accelerator: 'CmdOrCtrl+1',
          click: (): void => {
            const win = BrowserWindow.getFocusedWindow();
            win?.webContents.send('set-mode', 'single');
          },
        },
      ],
    },

    // Edit Menu (needed for copy/paste to work)
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac
          ? [
              { role: 'pasteAndMatchStyle' as const },
              { role: 'delete' as const },
              { role: 'selectAll' as const },
            ]
          : [
              { role: 'delete' as const },
              { type: 'separator' as const },
              { role: 'selectAll' as const },
            ]),
      ],
    },

    // Window Menu
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [{ type: 'separator' as const }, { role: 'front' as const }]
          : [{ role: 'close' as const }]),
      ],
    },

    // Help Menu
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn to Play',
          click: async (): Promise<void> => {
            await shell.openExternal('https://en.wikipedia.org/wiki/Tic-tac-toe');
          },
        },
        { type: 'separator' },
        {
          label: 'Report Issue',
          click: async (): Promise<void> => {
            await shell.openExternal(
              'https://github.com/hamid-nazar/Tic-tac-tao-with-Electron/issues'
            );
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

/**
 * Creates the Dock menu for macOS.
 *
 * The Dock menu appears when you right-click the app icon in the Dock.
 * It provides quick actions without needing to focus the app window.
 * This only works on macOS - other platforms ignore it.
 */
export function createDockMenu(): void {
  // Dock menu is macOS only
  if (process.platform !== 'darwin') {
    return;
  }

  const dockMenu = Menu.buildFromTemplate([
    {
      label: 'New Game',
      click: (): void => {
        const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
        if (win) {
          win.webContents.send('new-game');
          win.show(); // Bring window to front
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Single Player',
      click: (): void => {
        const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
        if (win) {
          win.webContents.send('set-mode', 'single');
          win.show();
        }
      },
    },
    {
      label: 'Two Player',
      click: (): void => {
        const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
        if (win) {
          win.webContents.send('set-mode', 'two-player');
          win.show();
        }
      },
    },
  ]);

  // app.dock is only available on macOS
  if (app.dock) {
    app.dock.setMenu(dockMenu);
  }
}
