<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <title>SOS Africa</title>
    
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#0f172a" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    
    <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
    <link rel="icon" type="image/png" href="/icons/icon-192x192.png" />

    <style>
      body { background-color: #0f172a; margin: 0; font-family: sans-serif; }
      #loading-screen { position: fixed; inset: 0; background: #0f172a; display: flex; align-items: center; justify-content: center; z-index: 9999; }
      .spinner { width: 40px; height: 40px; border: 4px solid rgba(220, 38, 38, 0.2); border-top-color: #dc2626; border-radius: 50%; animation: spin 1s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
  </head>
  <body>
    <div id="loading-screen"><div class="spinner"></div></div>
    <div id="root"></div>
    
    <script type="module" src="/src/main.jsx"></script>

    <script>
      // 1. Masquer le loader quand l'app est prête
      window.addEventListener('load', () => {
        const loader = document.getElementById('loading-screen');
        setTimeout(() => { loader.style.display = 'none'; }, 500);
      });

      // 2. ENREGISTREMENT DU SERVICE WORKER (Crucial pour l'installation)
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('✅ SOS Africa est installable !'))
            .catch(err => console.log('❌ Erreur PWA:', err));
        });
      }
    </script>
  </body>
</html>