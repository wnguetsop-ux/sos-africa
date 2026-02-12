import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Résolution des chemins
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
    }
  },

  // Configuration du serveur de développement
  server: {
    port: 3000,
    host: true, // Exposer sur le réseau local pour tester sur mobile
    strictPort: true,
  },

  // Configuration de la preview
  preview: {
    port: 4173,
    host: true,
  },

  // Configuration du build
  build: {
    // Répertoire de sortie (pour Capacitor)
    outDir: 'dist',
    
    // Générer des sourcemaps pour le debugging
    sourcemap: false, // Désactiver en prod pour réduire la taille
    
    // Taille minimale des chunks
    chunkSizeWarningLimit: 500,
    
    // Optimisations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Supprimer les console.log en prod
        drop_debugger: true,
      },
    },
    
    // Rollup options
    rollupOptions: {
      output: {
        // Séparer les vendors pour une meilleure mise en cache
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['lucide-react'],
        },
      },
    },
  },

  // Optimisations pour le dev
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
  },

  // Variables d'environnement exposées au client
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
});