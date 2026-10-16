# Warframe Equipment Overlay

A lightweight, transparent in-game overlay built with Electron that lets you browse Warframe, weapon, companion, and mod information without leaving the game.

Featuring a searchable equipment database, favorites, and global keyboard shortcuts, the overlay provides quick access to useful information while playing Warframe.

## Features

- **In-game overlay** — Transparent, borderless window that stays on top of other applications.
- **Equipment database** — Browse Warframes, weapons, mods, companions, and other equipment.
- **Search** — Quickly find items by name.
- **Favorites** — Save frequently used items for easy access between sessions.
- **Global keyboard shortcuts** — Control the overlay without leaving the game.
- **Click-through mode** — Let mouse clicks pass through the overlay to interact with the game underneath.
- **Lightweight interface** — Dark, semi-transparent UI designed to minimize distractions.

## Requirements

- [Node.js](https://nodejs.org/) and npm
- Windows
- An internet connection to download dependencies and load remote item images

## Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/YOUR_USERNAME/warframe-overlay.git
cd warframe-overlay
npm install
```

Start the application:

```bash
npm start
```

The application includes a small demo dataset, allowing you to explore the interface, search functionality, and favorites without downloading the full equipment database.

## Full Equipment Database

The default dataset contains a limited selection of items for demonstration purposes.

To load the full equipment database, install [`warframe-items`](https://www.npmjs.com/package/warframe-items), a community-maintained package that provides data derived from Warframe's official Public Export.

Install the package and generate the database:

```bash
npm install warframe-items
npm run build-data
```

This generates `data/items.json` with the available equipment data provided by the package.

Item images are loaded from the public [WarframeStat.us CDN](https://cdn.warframestat.us/), so image assets do not need to be stored locally.

**Note:** Generating the full database may take some time, depending on your system and the package version.

## Keyboard Shortcuts

The following global shortcuts work while another application, including Warframe, is focused.

| Shortcut | Action |
|---|---|
| `Ctrl + Shift + O` | Show or hide the overlay |
| `Ctrl + Shift + L` | Toggle click-through mode |

These shortcuts can be customized in `main.js` using Electron's `globalShortcut` API.

## Project Structure

```text
warframe-overlay/
├── main.js               # Electron main process and window management
├── preload.js            # Secure bridge between the main and renderer processes
├── package.json          # Project metadata, dependencies, and scripts
├── package-lock.json     # Locked dependency versions
├── data/
│   └── items.json        # Local equipment database
├── scripts/
│   └── build-data.js     # Equipment database generation script
└── src/
    ├── index.html        # Application interface
    ├── renderer.js       # Search, filtering, favorites, and item details
    └── style.css         # Overlay styling
```

## Technical Overview

### Overlay Window

The application uses Electron's `BrowserWindow` to create a transparent, frameless window that stays above other windows.

It is designed to work best with Warframe running in **borderless windowed mode**. Exclusive fullscreen mode may prevent the overlay from appearing above the game, depending on the system and graphics configuration.

### Click-Through Mode

Electron's `setIgnoreMouseEvents()` allows mouse events to pass through the overlay to the application underneath. This makes it possible to keep information visible without interfering with gameplay.

### Favorites Storage

Favorites are stored locally using `electron-store` and persist between application sessions.

### Equipment Data

Equipment information is loaded from `data/items.json`. The bundled demo dataset can be replaced with data generated through the `warframe-items` package.

## Roadmap

Potential future improvements include:

- **Build management** — Create, save, and manage equipment builds with custom mod configurations.
- **Compact mode** — Provide a minimized interface with a search bar and essential information.
- **Equipment detection** — Investigate ways to identify the currently equipped weapon or Warframe using supported game data or log files, where available.
- **Standalone executable** — Package the application as a portable Windows executable using `electron-builder`.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

Warframe and all related game assets are the property of Digital Extremes. This project is an independent community project and is not affiliated with, endorsed by, or sponsored by Digital Extremes.
