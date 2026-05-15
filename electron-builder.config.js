/**
 * Electron Builder Configuration
 * @see https://www.electron.build/configuration/configuration
 */
module.exports = {
  appId: 'com.hamidnazar.tictactao',
  productName: 'Tic-Tac-Toe',
  copyright: 'Copyright © 2026 Hamid Nazar',

  directories: {
    output: 'release',
    buildResources: 'build',
  },

  files: [
    'dist/**/*',
    'assets/**/*',
    'package.json',
  ],

  extraMetadata: {
    main: 'dist/main/main.js',
  },

  mac: {
    category: 'public.app-category.games',
    icon: 'assets/icon.icns',
    darkModeSupport: true,
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.plist',
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64'],
      },
      {
        target: 'zip',
        arch: ['x64', 'arm64'],
      },
    ],
  },

  dmg: {
    title: '${productName} ${version}',
    icon: 'assets/icon.icns',
    contents: [
      {
        x: 130,
        y: 220,
      },
      {
        x: 410,
        y: 220,
        type: 'link',
        path: '/Applications',
      },
    ],
    window: {
      width: 540,
      height: 380,
    },
  },

  // Code signing (configure when ready for distribution)
  afterSign: undefined, // Add notarization script path here

  // Auto-update configuration (for future use)
  publish: null,
};
