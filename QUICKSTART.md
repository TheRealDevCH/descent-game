# ⚡ Quick Start Guide - DESCENT

## 🎮 In 3 Schritten zum Spielen

### 1️⃣ Dependencies installieren
```bash
cd descent-game
npm install
```

### 2️⃣ Development Server starten
```bash
npm run dev
```

### 3️⃣ Im Browser öffnen
Das Spiel öffnet sich automatisch unter: **http://localhost:3000**

---

## 🚀 Sofort deployen (öffentlich machen)

### Schnellste Methode: Vercel CLI

```bash
# Vercel CLI installieren (einmalig)
npm install -g vercel

# Deployen
cd descent-game
vercel

# Production Deployment
vercel --prod
```

**Fertig!** Du erhältst eine öffentliche URL wie: `https://descent-game-xyz.vercel.app`

---

## 🎯 Steuerung

### Desktop
- **Pfeiltasten** ← → oder **A/D** zum Bewegen
- **ESC** zum Pausieren

### Mobile
- **Tippe links/rechts** auf den Bildschirm zum Bewegen

---

## 🌍 Sprache ändern

1. Klicke auf **"Einstellungen"** im Hauptmenü
2. Wähle deine Sprache: **Deutsch** / **English** / **Français**

---

## 🎨 Das Spiel anpassen

### Farben ändern
Bearbeite `src/game/TunnelGenerator.js` → `getColorForDepth()`

### Schwierigkeit anpassen
Bearbeite `src/store/gameStore.js` → `updateDepth()`

### Sounds ändern
Bearbeite `src/utils/audioSystem.js`

---

## 📁 Wichtige Dateien

```
descent-game/
├── src/
│   ├── components/      # UI Komponenten (Menüs, Screens)
│   ├── game/           # Game Engine (Tunnel, Hindernisse)
│   ├── i18n/           # Übersetzungen (de, en, fr)
│   └── store/          # Game State
├── README.md           # Vollständige Dokumentation
├── DEPLOYMENT.md       # Deployment Guide
└── package.json        # Dependencies
```

---

## 🐛 Probleme?

### Spiel startet nicht
```bash
# Node.js Version prüfen (sollte 16+ sein)
node --version

# Neu installieren
rm -rf node_modules
npm install
```

### Port 3000 bereits belegt
```bash
# Anderen Port verwenden
npm run dev -- --port 3001
```

### Build-Fehler
```bash
# Cache löschen
rm -rf node_modules dist
npm install
npm run build
```

---

## 📚 Mehr Infos

- **Vollständige Dokumentation**: Siehe `README.md`
- **Deployment Guide**: Siehe `DEPLOYMENT.md`
- **Projektstruktur**: Siehe `README.md` → "Projektstruktur"

---

## 🎉 Viel Spaß!

**Wie tief kannst du fallen?** 🚀

Teile deinen Highscore auf Social Media mit **#DescentGame**!

