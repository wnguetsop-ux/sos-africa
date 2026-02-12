import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Download, Eye, Clock, 
  MapPin, Shield, TrendingUp, Calendar, 
  Activity, Smartphone, Globe, ChevronRight,
  Lock, X, RefreshCw, AlertTriangle
} from 'lucide-react';

// Code d'accès admin (à changer)
const ADMIN_CODE = 'sos2024admin';

const AdminPage = ({ onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Charger les statistiques
  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
    }
  }, [isAuthenticated]);

  const handleAuth = () => {
    if (code === ADMIN_CODE) {
      setIsAuthenticated(true);
      setError('');
      localStorage.setItem('sos_admin_auth', 'true');
    } else {
      setError('Code incorrect');
    }
  };

  // Vérifier si déjà authentifié
  useEffect(() => {
    const auth = localStorage.getItem('sos_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const loadStats = () => {
    setLoading(true);
    
    // Récupérer les stats depuis localStorage
    const allStats = JSON.parse(localStorage.getItem('sos_app_stats') || '{}');
    
    // Stats par défaut + stats réelles
    const defaultStats = {
      totalUsers: allStats.totalUsers || 0,
      activeUsers: allStats.activeUsers || 0,
      downloads: allStats.downloads || 0,
      alertsSent: allStats.alertsSent || 0,
      avgSessionTime: allStats.avgSessionTime || '0:00',
      countries: allStats.countries || {},
      dailyActive: allStats.dailyActive || [],
      features: allStats.features || {
        sos: 0,
        shake: 0,
        ghost: 0,
        journey: 0,
        recording: 0,
        fakecall: 0
      },
      donations: allStats.donations || {
        total: 0,
        count: 0
      },
      lastUpdated: new Date().toISOString()
    };

    // Ajouter les stats de cette session
    const sessionStats = JSON.parse(localStorage.getItem('sos_session_stats') || '{}');
    
    setStats({
      ...defaultStats,
      currentSession: sessionStats
    });
    
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('sos_admin_auth');
    setIsAuthenticated(false);
  };

  // Exporter les données
  const exportData = () => {
    const data = {
      stats,
      exportedAt: new Date().toISOString(),
      version: '2.3'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sos-africa-stats-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Écran de connexion
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin SOS Africa</h1>
            <p className="text-slate-400 text-sm mt-2">Accès réservé à l'administrateur</p>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Code d'accès"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
            />

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              onClick={handleAuth}
              className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 transition-colors"
            >
              Accéder
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 text-slate-400 hover:text-white transition-colors"
            >
              Retour à l'application
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Admin
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Dashboard Admin</h1>
              <p className="text-xs text-slate-500">SOS Africa Analytics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={loadStats}
              disabled={loading}
              className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 max-w-4xl mx-auto pb-24">
        {/* Stats principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            icon={Users} 
            label="Utilisateurs totaux" 
            value={stats?.totalUsers || 0}
            color="blue"
          />
          <StatCard 
            icon={Activity} 
            label="Utilisateurs actifs" 
            value={stats?.activeUsers || 0}
            color="green"
          />
          <StatCard 
            icon={Download} 
            label="Téléchargements" 
            value={stats?.downloads || 0}
            color="purple"
          />
          <StatCard 
            icon={AlertTriangle} 
            label="Alertes envoyées" 
            value={stats?.alertsSent || 0}
            color="red"
          />
        </div>

        {/* Utilisation des fonctionnalités */}
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 mb-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Utilisation des fonctionnalités
          </h3>

          <div className="space-y-3">
            {[
              { name: 'Bouton SOS', value: stats?.features?.sos || 0, color: 'red' },
              { name: 'Secouer pour alerter', value: stats?.features?.shake || 0, color: 'yellow' },
              { name: 'Mode Furtif', value: stats?.features?.ghost || 0, color: 'purple' },
              { name: 'Mode Trajet', value: stats?.features?.journey || 0, color: 'green' },
              { name: 'Enregistrement Audio', value: stats?.features?.recording || 0, color: 'blue' },
              { name: 'Faux Appel', value: stats?.features?.fakecall || 0, color: 'orange' }
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-slate-300">{feature.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-${feature.color}-500 rounded-full`}
                      style={{ width: `${Math.min((feature.value / (stats?.alertsSent || 1)) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-white font-mono w-12 text-right">{feature.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dons */}
        <div className="bg-gradient-to-r from-pink-500/20 to-red-500/20 rounded-2xl p-4 border border-pink-500/30 mb-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-pink-400" />
            Donations
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 rounded-xl p-4">
              <p className="text-3xl font-bold text-pink-400">
                {(stats?.donations?.total || 0).toLocaleString()} FCFA
              </p>
              <p className="text-slate-400 text-sm">Total reçu</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4">
              <p className="text-3xl font-bold text-white">
                {stats?.donations?.count || 0}
              </p>
              <p className="text-slate-400 text-sm">Nombre de dons</p>
            </div>
          </div>
        </div>

        {/* Pays */}
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 mb-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            Répartition par pays
          </h3>

          <div className="space-y-2">
            {Object.entries(stats?.countries || { 'Cameroun': 0, 'Côte d\'Ivoire': 0, 'Sénégal': 0 }).map(([country, count], idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">{country}</span>
                <span className="text-white font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Session actuelle */}
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 mb-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-green-400" />
            Session actuelle
          </h3>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-700/30 rounded-lg p-3">
              <p className="text-slate-400">Début</p>
              <p className="text-white">{stats?.currentSession?.startTime || 'N/A'}</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3">
              <p className="text-slate-400">Durée</p>
              <p className="text-white">{stats?.currentSession?.duration || '0:00'}</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3">
              <p className="text-slate-400">Pages vues</p>
              <p className="text-white">{stats?.currentSession?.pageViews || 0}</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3">
              <p className="text-slate-400">Actions</p>
              <p className="text-white">{stats?.currentSession?.actions || 0}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={exportData}
            className="w-full p-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Exporter les données (JSON)
          </button>

          <button
            onClick={onClose}
            className="w-full p-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors"
          >
            Retour à l'application
          </button>
        </div>

        {/* Dernière mise à jour */}
        <p className="text-center text-slate-500 text-xs mt-4">
          Dernière mise à jour: {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleString('fr-FR') : 'N/A'}
        </p>
      </main>
    </div>
  );
};

// Composant StatCard
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    purple: 'bg-purple-500/20 text-purple-400',
    red: 'bg-red-500/20 text-red-400'
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorClasses[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
      <p className="text-slate-400 text-xs">{label}</p>
    </div>
  );
};

export default AdminPage;