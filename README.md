# Tic-Tac-Toe with Electron

A professional Tic-Tac-Toe game built with Electron for macOS.

## Features

- Single player mode against AI (Easy, Medium, Hard difficulties)
- Two player local multiplayer
- Native macOS application with DMG installer
- Score tracking across games
- Clean, modern UI with animations

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)
- macOS 10.15 or higher (for running the app)

## Installation

### From Release

Download the latest `.dmg` file from the [Releases](https://github.com/hamid-nazar/Tic-tac-tao-with-Electron/releases) page and drag the app to your Applications folder.

### From Source

```bash
# Clone the repository
git clone https://github.com/hamid-nazar/Tic-tac-tao-with-Electron.git
cd Tic-tac-tao-with-Electron

# Install dependencies
npm install

# Start in development mode
npm run dev

# Build for production
npm run build

# Package for macOS
npm run package
```

## Development

### Project Structure

```
tic-tac-tao/
├── src/
│   ├── main/           # Electron main process
│   ├── renderer/       # UI and game logic
│   └── shared/         # Shared types and utilities
├── assets/             # Images, icons, sounds
├── tests/              # Test files
├── scripts/            # Build and utility scripts
└── dist/               # Compiled output
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start app in development mode |
| `npm run build` | Compile TypeScript |
| `npm run test` | Run test suite |
| `npm run lint` | Run ESLint |
| `npm run package` | Create macOS DMG |

### Tech Stack

- **Electron** - Desktop application framework
- **TypeScript** - Type-safe JavaScript
- **Jest** - Testing framework
- **electron-builder** - Packaging and distribution

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript strict mode
- Follow ESLint configuration
- Write tests for new features
- Keep commits atomic and descriptive

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built as a learning project for Electron development
- Inspired by the classic Tic-Tac-Toe game
