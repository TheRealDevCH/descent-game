# 🚀 Deployment Guide - DESCENT

Dieses Dokument erklärt, wie du DESCENT öffentlich deployen kannst.

## 📦 Vercel Deployment (Empfohlen)

Vercel ist die einfachste und schnellste Methode, um das Spiel zu deployen.

### Option 1: Vercel CLI (Schnellste Methode)

1. **Vercel CLI installieren:**
```bash
npm install -g vercel
```

2. **Im Projektordner deployen:**
```bash
cd descent-game
vercel
```

3. **Folge den Anweisungen:**
   - Login mit GitHub/GitLab/Bitbucket oder Email
   - Bestätige das Projekt
   - Wähle "No" für "Link to existing project"
   - Bestätige die Einstellungen

4. **Production Deployment:**
```bash
vercel --prod
```

5. **Fertig!** Du erhältst eine URL wie: `https://descent-game-xyz.vercel.app`

### Option 2: GitHub Integration (Automatische Deployments)

1. **Repository auf GitHub erstellen:**
```bash
cd descent-game
git init
git add .
git commit -m "Initial commit - DESCENT game"
git branch -M main
git remote add origin https://github.com/DEIN-USERNAME/descent-game.git
git push -u origin main
```

2. **Vercel mit GitHub verbinden:**
   - Gehe zu [vercel.com](https://vercel.com)
   - Klicke auf "New Project"
   - Importiere dein GitHub Repository
   - Vercel erkennt automatisch Vite
   - Klicke auf "Deploy"

3. **Automatische Deployments:**
   - Jeder Push zu `main` triggert ein neues Deployment
   - Pull Requests erhalten Preview-URLs

### Option 3: Drag & Drop (Ohne Git)

1. **Build erstellen:**
```bash
cd descent-game
npm run build
```

2. **Zu Vercel hochladen:**
   - Gehe zu [vercel.com](https://vercel.com)
   - Ziehe den `dist/` Ordner auf die Website
   - Warte auf das Deployment

## 🌐 Netlify Deployment

### Via Netlify CLI

1. **Netlify CLI installieren:**
```bash
npm install -g netlify-cli
```

2. **Deployen:**
```bash
cd descent-game
npm run build
netlify deploy --prod --dir=dist
```

### Via Netlify Website

1. **Build erstellen:**
```bash
npm run build
```

2. **Zu Netlify hochladen:**
   - Gehe zu [netlify.com](https://netlify.com)
   - Ziehe den `dist/` Ordner auf die Website

## 🐙 GitHub Pages

1. **GitHub Pages Package installieren:**
```bash
npm install --save-dev gh-pages
```

2. **package.json anpassen:**
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://DEIN-USERNAME.github.io/descent-game"
}
```

3. **vite.config.js anpassen:**
```javascript
export default defineConfig({
  base: '/descent-game/',
  // ... rest of config
})
```

4. **Deployen:**
```bash
npm run deploy
```

## 🔧 Custom Server (VPS/Dedicated)

### Mit Nginx

1. **Build erstellen:**
```bash
npm run build
```

2. **Dateien auf Server kopieren:**
```bash
scp -r dist/* user@your-server.com:/var/www/descent-game/
```

3. **Nginx konfigurieren:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/descent-game;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

4. **Nginx neu starten:**
```bash
sudo systemctl restart nginx
```

## 🔒 HTTPS Setup (Let's Encrypt)

Für Vercel/Netlify: Automatisch aktiviert ✅

Für Custom Server:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 📊 Performance-Optimierungen

### Build-Optimierungen (bereits konfiguriert)

Die `vite.config.js` enthält bereits:
- Minification
- Tree-shaking
- Code-splitting
- Asset-Optimierung

### CDN-Optimierung

Für Vercel/Netlify: Automatisch aktiviert ✅

Für Custom Server: Verwende Cloudflare als CDN:
1. Domain zu Cloudflare hinzufügen
2. DNS-Einträge konfigurieren
3. Caching-Regeln aktivieren

## 🌍 Custom Domain

### Vercel

1. Gehe zu deinem Projekt auf Vercel
2. Settings → Domains
3. Füge deine Domain hinzu
4. Folge den DNS-Anweisungen

### Netlify

1. Gehe zu deinem Projekt auf Netlify
2. Domain Settings → Add custom domain
3. Folge den DNS-Anweisungen

## 📱 PWA (Progressive Web App) - Optional

Um das Spiel als PWA zu machen:

1. **Vite PWA Plugin installieren:**
```bash
npm install -D vite-plugin-pwa
```

2. **vite.config.js erweitern:**
```javascript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'DESCENT - Endless Falling Game',
        short_name: 'DESCENT',
        description: 'Wie tief kannst du fallen?',
        theme_color: '#667eea',
        icons: [
          {
            src: '/icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ]
})
```

## 🔍 SEO-Optimierung

Die `index.html` enthält bereits:
- Meta-Tags
- Description
- Theme-Color
- Viewport-Settings

Für besseres SEO, füge hinzu:
- Open Graph Tags
- Twitter Cards
- Sitemap
- robots.txt

## 📈 Analytics (Optional)

### Google Analytics

Füge in `index.html` vor `</head>` ein:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Plausible Analytics (Privacy-friendly)

```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

## 🐛 Troubleshooting

### Build schlägt fehl
```bash
# Cache löschen
rm -rf node_modules dist
npm install
npm run build
```

### 404 Fehler nach Deployment
- Stelle sicher, dass `vercel.json` vorhanden ist
- Für andere Hosts: Konfiguriere SPA-Routing

### Assets laden nicht
- Überprüfe `base` in `vite.config.js`
- Stelle sicher, dass Pfade relativ sind

## ✅ Deployment Checklist

Vor dem Deployment:
- [ ] `npm run build` funktioniert ohne Fehler
- [ ] Spiel lokal getestet (`npm run dev`)
- [ ] Alle drei Sprachen funktionieren
- [ ] Mobile-Version getestet
- [ ] Audio funktioniert
- [ ] Highscores werden gespeichert
- [ ] Performance ist gut (60 FPS)

Nach dem Deployment:
- [ ] Spiel auf Production-URL getestet
- [ ] Mobile-Version auf echtem Gerät getestet
- [ ] Alle Sprachen funktionieren
- [ ] HTTPS ist aktiv
- [ ] Custom Domain konfiguriert (optional)
- [ ] Analytics eingerichtet (optional)

## 🎉 Fertig!

Dein Spiel ist jetzt live! Teile die URL:
- Auf Social Media
- Mit Streamern
- In Gaming-Communities
- Auf Reddit (r/WebGames, r/IndieGaming)

## 📞 Support

Bei Problemen:
1. Überprüfe die Browser-Konsole auf Fehler
2. Teste in verschiedenen Browsern
3. Überprüfe die Deployment-Logs

Viel Erfolg! 🚀

