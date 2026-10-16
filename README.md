# Warframe Equipment Overlay

Overlay in-game léger (Electron) pour consulter les stats des Warframes, armes et mods
sans quitter le jeu — fenêtre transparente, toujours au-dessus, avec recherche et favoris.

## Installation

```bash
npm install
npm start
```

Ça suffit pour lancer l'overlay avec un petit jeu de données de démo (6 items dans
`data/items.json`) — de quoi tester tout de suite l'UI, la recherche, les favoris, etc.

## Charger la base de données complète

Le projet de démo n'inclut que quelques items pour rester léger. Pour avoir **toute**
la base Warframe (armes, warframes, mods, compagnons...), installe le package
communautaire `warframe-items` (maintenu par WFCD, qui scrape la Public Export
officielle de Digital Extremes) puis génère le fichier de données :

```bash
npm install warframe-items
npm run build-data
```

Ça régénère `data/items.json` avec la base complète et à jour. Les images sont
chargées directement depuis le CDN public `cdn.warframestat.us`, donc pas besoin
de télécharger les assets toi-même.

⚠️ `warframe-items` est assez volumineux (il embarque beaucoup de métadonnées) —
compte quelques dizaines de secondes pour l'install et la génération.

## Raccourcis clavier (globaux, marchent même quand le jeu a le focus)

| Raccourci        | Action                                  |
|-------------------|------------------------------------------|
| `Ctrl+Shift+O`    | Afficher / masquer l'overlay             |
| `Ctrl+Shift+L`    | Activer/désactiver le "click-through" (les clics traversent la fenêtre pour ne pas gêner le jeu) |

Tu peux les changer dans `main.js` (`globalShortcut.register(...)`).

## Structure du projet

```
warframe-overlay/
├── main.js            # Processus principal Electron : fenêtre, raccourcis, IPC
├── preload.js         # Pont sécurisé entre main et renderer (contextBridge)
├── src/
│   ├── index.html     # Structure de l'UI
│   ├── style.css       # Style sombre semi-transparent
│   └── renderer.js     # Logique : recherche, filtres, favoris, détail item
├── scripts/
│   └── build-data.js   # Génère data/items.json depuis warframe-items
├── data/
│   └── items.json      # Base de données locale (démo par défaut)
└── package.json
```

## Comment ça marche techniquement

- **Fenêtre overlay** : `BrowserWindow` transparente, sans bordure (`frame: false`),
  toujours au-dessus (`alwaysOnTop`), visible sur tous les bureaux et par-dessus le
  plein écran fenêtré (`setVisibleOnAllWorkspaces`). Fonctionne bien avec les jeux
  qui tournent en mode "Fenêtré sans bordure" — le plein écran exclusif (DirectX)
  peut bloquer l'affichage de tout overlay, c'est une limitation Windows, pas
  spécifique à ce projet.
- **Click-through** : `setIgnoreMouseEvents(true)` permet aux clics de traverser
  la fenêtre vers le jeu en dessous, pour ne pas gêner le gameplay quand tu veux
  juste garder l'info affichée à l'écran.
- **Favoris** : stockés localement via `electron-store` (fichier JSON dans le
  dossier de config utilisateur), persistent entre les sessions.
- **Données** : chargées depuis `data/items.json` (généré par `warframe-items`,
  qui lui-même s'appuie sur la Public Export officielle de Digital Extremes).

## Prochaines étapes possibles

- Ajouter un vrai système de builds (combos de mods sauvegardés par arme/warframe)
- Détection automatique de l'arme équipée en jeu (plus complexe, nécessiterait de
  lire la mémoire du process ou un log du jeu — à étudier si tu veux aller plus loin)
- Overlay "compact mode" (juste une barre de recherche minimisée)
- Empaqueter en `.exe` portable avec `npm run dist` (electron-builder déjà configuré)

## Licence

MIT — fais-en ce que tu veux. Les données Warframe restent la propriété de
Digital Extremes ; ce projet n'est ni affilié ni approuvé par eux.
