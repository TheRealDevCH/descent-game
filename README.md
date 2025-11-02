# 🎮 DESCENT - Endless Falling Game

Ein virales Single-Player Skill-Game, das Streamer und Content Creator herausfordert! Wie tief kannst du fallen?

[English](#english) | [Français](#français)

---

## 🇩🇪 Deutsch

### 🎯 Spielkonzept

**DESCENT** ist ein intensives Endless-Falling-Game mit Dribbble-inspirierter Grafik. Du fällst endlos durch einen prozedural generierten Tunnel und musst Hindernissen ausweichen. Je tiefer du kommst, desto schneller wirst du - und desto schwieriger wird es!

#### Warum ist es viral?

- **"Wie tief bist du gekommen?"** - Perfekte Metrik für Highscore-Vergleiche
- **Near-Death Momente** - Knappe Ausweichmanöver sind clip-würdig für TikTok/YouTube Shorts
- **Geschwindigkeitsrausch** - Wird immer intensiver und fordert Streamer heraus
- **Procedural Generation** - Jeder Run ist anders
- **"Just one more try"** - Extrem hoher Suchtfaktor
- **Depth Milestones** - Alle 1000m gibt es visuelle Belohnungen

### 🎨 Visuelle Features

- **Dribbble-Style Grafik**: Weiche Gradienten, Glassmorphism, moderne Farbpalette
- **Dynamische Farbwechsel**: Tunnel ändert Farbe basierend auf Tiefe
  - 0-2000m: Soft Blue → Purple
  - 2000-5000m: Pink → Orange
  - 5000-10000m: Red → Deep Purple
  - 10000m+: Gold → Deep Blue
- **Partikel-Effekte**: Speed-Lines, Milestone-Bursts, Screen-Shake
- **Smooth Animations**: Alle UI-Elemente mit flüssigen Übergängen

### 🎮 Gameplay

#### Steuerung
- **Desktop**: Pfeiltasten (← →) oder A/D
- **Mobile**: Tippe links/rechts auf den Bildschirm
- **Pause**: ESC-Taste

#### Hindernisse
1. **Wände mit Lücken**: Navigiere durch die Öffnung
2. **Rotierende Kreuze**: Timing ist alles
3. **Bewegende Blöcke**: Weiche den wandernden Hindernissen aus

#### Schwierigkeitssteigerung
- Geschwindigkeit erhöht sich mit der Tiefe
- Lücken werden kleiner
- Mehr komplexe Hindernisse erscheinen
- Rotationsgeschwindigkeit nimmt zu

### 🚀 Installation & Start

#### Voraussetzungen
- Node.js (Version 16 oder höher)
- npm oder yarn

#### Schritt 1: Dependencies installieren
```bash
cd descent-game
npm install
```

#### Schritt 2: Development Server starten
```bash
npm run dev
```

Das Spiel öffnet sich automatisch im Browser unter `http://localhost:3000`

#### Schritt 3: Production Build erstellen
```bash
npm run build
```

Die fertigen Dateien befinden sich im `dist/` Ordner.

### 🌐 Deployment auf Vercel

#### Option 1: Vercel CLI
```bash
# Vercel CLI installieren
npm install -g vercel

# Im Projektordner
cd descent-game
vercel
```

#### Option 2: GitHub Integration
1. Push das Projekt zu GitHub
2. Gehe zu [vercel.com](https://vercel.com)
3. Klicke auf "New Project"
4. Importiere dein GitHub Repository
5. Vercel erkennt automatisch die Vite-Konfiguration
6. Klicke auf "Deploy"

#### Option 3: Drag & Drop
1. Erstelle einen Production Build: `npm run build`
2. Gehe zu [vercel.com](https://vercel.com)
3. Ziehe den `dist/` Ordner auf die Vercel-Website

### 🌍 Sprachen

Das Spiel unterstützt drei Sprachen:
- **Deutsch** (Standard)
- **English**
- **Français**

Die Sprache kann im Einstellungsmenü gewechselt werden. Die Auswahl wird im Browser gespeichert.

### 🎵 Audio

- **Hintergrundmusik**: Ambient Drone (prozedural generiert)
- **Sound Effects**:
  - Whoosh (Hindernisse passieren)
  - Collision (Game Over)
  - Milestone (1000m Meilensteine)
  - Click (UI-Interaktionen)

Alle Sounds werden mit der Web Audio API prozedural generiert - keine Audio-Dateien nötig!

### 📁 Projektstruktur

```
descent-game/
├── public/
│   └── icon.svg                 # App Icon
├── src/
│   ├── components/              # React Komponenten
│   │   ├── MainMenu.jsx/css    # Hauptmenü
│   │   ├── Game.jsx/css        # Spielbildschirm
│   │   ├── GameOver.jsx/css    # Game Over Screen
│   │   ├── Settings.jsx/css    # Einstellungen
│   │   └── HowToPlay.jsx/css   # Anleitung
│   ├── game/                    # Game Engine
│   │   ├── GameEngine.js       # Haupt-Engine
│   │   ├── TunnelGenerator.js  # Tunnel-Generierung
│   │   ├── ObstacleManager.js  # Hindernis-System
│   │   └── ParticleSystem.js   # Partikel-Effekte
│   ├── i18n/                    # Übersetzungen
│   │   ├── de.json             # Deutsch
│   │   ├── en.json             # English
│   │   ├── fr.json             # Français
│   │   └── config.js           # i18n Setup
│   ├── store/
│   │   └── gameStore.js        # Zustand State Management
│   ├── utils/
│   │   └── audioSystem.js      # Audio Engine
│   ├── App.jsx                  # Haupt-App
│   ├── App.css                  # Globale Styles
│   ├── main.jsx                 # Entry Point
│   └── index.css                # Base Styles
├── index.html                   # HTML Template
├── package.json                 # Dependencies
├── vite.config.js              # Vite Konfiguration
├── vercel.json                 # Vercel Deployment Config
└── README.md                    # Diese Datei
```

### 🛠️ Technologie-Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **3D Engine**: Three.js
- **State Management**: Zustand
- **Internationalization**: i18next
- **Audio**: Web Audio API + Howler.js
- **Styling**: CSS Modules + CSS Variables
- **Deployment**: Vercel

### 🎯 Performance-Optimierungen

- Procedural Generation für minimale Asset-Größe
- Object Pooling für Hindernisse
- Effizientes Culling (Entfernen von Objekten außerhalb der Sicht)
- Optimierte Shader für Tunnel-Rendering
- Lazy Loading von Komponenten
- Minimierte Bundle-Größe

### 📱 Mobile Support

Das Spiel ist vollständig responsive und funktioniert auf:
- Desktop (Tastatur-Steuerung)
- Tablets (Touch-Steuerung)
- Smartphones (Touch-Steuerung)

Touch-Optimierungen:
- Große Touch-Bereiche
- Visuelle Touch-Feedback
- Verhindert Pull-to-Refresh
- Verhindert Double-Tap-Zoom

### 🏆 Highscore-System

- Highscores werden im Browser (LocalStorage) gespeichert
- Persönlicher Rekord wird auf dem Game Over Screen angezeigt
- Neue Rekorde werden visuell hervorgehoben

### 🎨 Anpassung

#### Farben ändern
Bearbeite die Farbpaletten in `src/game/TunnelGenerator.js`:

```javascript
getColorForDepth(depth) {
  if (depth < 2000) {
    return {
      start: 0x667eea,  // Deine Farbe hier
      end: 0x764ba2,
      accent: 0x9f7aea
    };
  }
  // ...
}
```

#### Schwierigkeit anpassen
Bearbeite `src/store/gameStore.js`:

```javascript
updateDepth: (newDepth) => {
  set({
    speed: 1 + (newDepth / 5000), // Ändere 5000 für schnellere/langsamere Progression
  });
}
```

### 🐛 Troubleshooting

#### Das Spiel startet nicht
- Stelle sicher, dass Node.js installiert ist: `node --version`
- Lösche `node_modules` und installiere neu: `rm -rf node_modules && npm install`

#### Performance-Probleme
- Reduziere die Pixel Ratio in `GameEngine.js`:
  ```javascript
  this.renderer.setPixelRatio(1); // Statt Math.min(window.devicePixelRatio, 2)
  ```

#### Audio funktioniert nicht
- Moderne Browser blockieren Auto-Play. Audio startet erst nach User-Interaktion
- Überprüfe Browser-Konsole auf Fehler

### 📄 Lizenz

Dieses Projekt ist für persönliche und kommerzielle Nutzung frei verfügbar.

### 🤝 Beitragen

Feedback und Verbesserungsvorschläge sind willkommen!

---

## 🇬🇧 English

### 🎯 Game Concept

**DESCENT** is an intense endless-falling game with Dribbble-inspired graphics. You fall endlessly through a procedurally generated tunnel and must dodge obstacles. The deeper you go, the faster you get - and the harder it becomes!

#### Why is it viral?

- **"How deep did you get?"** - Perfect metric for highscore comparisons
- **Near-death moments** - Close dodges are clip-worthy for TikTok/YouTube Shorts
- **Speed rush** - Gets increasingly intense and challenges streamers
- **Procedural generation** - Every run is different
- **"Just one more try"** - Extremely high addiction factor
- **Depth milestones** - Visual rewards every 1000m

### 🚀 Quick Start

```bash
cd descent-game
npm install
npm run dev
```

### 🌐 Deploy to Vercel

```bash
npm install -g vercel
cd descent-game
vercel
```

Or use GitHub integration at [vercel.com](https://vercel.com)

### 🎮 Controls

- **Desktop**: Arrow keys (← →) or A/D
- **Mobile**: Tap left/right on screen
- **Pause**: ESC key

### 🌍 Languages

- German (default)
- English
- French

Change language in Settings menu.

---

## 🇫🇷 Français

### 🎯 Concept du Jeu

**DESCENT** est un jeu de chute infinie intense avec des graphismes inspirés de Dribbble. Tu tombes sans fin à travers un tunnel généré procéduralement et tu dois éviter les obstacles. Plus tu descends profondément, plus tu vas vite - et plus c'est difficile!

### 🚀 Démarrage Rapide

```bash
cd descent-game
npm install
npm run dev
```

### 🌐 Déployer sur Vercel

```bash
npm install -g vercel
cd descent-game
vercel
```

Ou utilise l'intégration GitHub sur [vercel.com](https://vercel.com)

### 🎮 Contrôles

- **Desktop**: Flèches (← →) ou A/D
- **Mobile**: Tape à gauche/droite sur l'écran
- **Pause**: Touche ESC

### 🌍 Langues

- Allemand (par défaut)
- Anglais
- Français

Change la langue dans le menu Paramètres.

---

## 🎉 Viel Spaß! / Have Fun! / Amusez-vous bien!

Erstellt mit ❤️ für Streamer und Content Creator

