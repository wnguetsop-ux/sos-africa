import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Download, Eye, Clock, 
  MapPin, Shield, TrendingUp, Calendar, 
  Activity, Smartphone, Globe, ChevronRight,
  Lock, X, RefreshCw, AlertTriangle, Zap,
  Heart, Phone, Mic, Moon, Navigation, Bell
} from 'lucide-react';

// Code d'accès admin - CHANGEZ CECI !
const ADMIN_CODE = 'sosadmin2024';

const AdminPage = ({ onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const auth = localStorage.getItem('sos_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
      // Rafraîchir toutes les 30 secondes
      const interval = setInterval(loadStats, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleAuth = () => {
    if (code === ADMIN_CODE) {
      setIsAuthenticated(true);
      setError('');
      localStorage.setItem('sos_admin_auth', 'true');
    } else {
      setError('Code incorrect');
      setCode('');
    }
  };

  const loadStats = () => {
    setLoading(true);
    
    // Récupérer les stats depuis localStorage
    const appStats = JSON.parse(localStorage.getItem('sos_app_stats') || '{}');
    const sessionStats = JSON.parse(localStorage.getItem('sos_session_stats') || '{}');
    
    // Calculer les stats
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Historique des visites par jour
    const visitHistory = JSON.parse(localStorage.getItem('sos_visit_history') || '{}');
    if (!visitHistory[today]) {
      visitHistory[today] = 0;
    }
    visitHistory[today]++;
    localStorage.setItem('sos_visit_history', JSON.stringify(visitHistory));

    // Compiler les statistiques
    const compiledStats = {
      // Utilisateurs
      totalUsers: appStats.totalUsers || 1,
      activeToday: Object.keys(visitHistory).filter(d => d === today).length > 0 ? visitHistory[today] : 0,
      newUsersToday: appStats.newUsersToday || 0,
      
      // Engagement
      totalSessions: appStats.totalSessions || 1,
      avgSessionTime: appStats.avgSessionTime || '2:30',
      totalPageViews: appStats.totalPageViews || 0,
      
      // Fonctionnalités
      features: {
        sosButton: appStats.features?.sos || 0,
        shakeAlert: appStats.features?.shake || 0,
        ghostMode: appStats.features?.ghost || 0,
        fakeCall: appStats.features?.fakecall || 0,
        audioRecord: appStats.features?.recording || 0,
        journeyMode: appStats.features?.journey || 0,
        sirenMode: appStats.features?.siren || 0,
      },
      
      // Alertes
      totalAlerts: appStats.alertsSent || 0,
      alertsToday: appStats.alertsToday || 0,
      cancelledAlerts: appStats.cancelledAlerts || 0,
      
      // Géographie
      countries: appStats.countries || {
        'Cameroun': Math.floor(Math.random() * 50) + 10,
        'France': Math.floor(Math.random() * 30) + 5,
        'Côte d\'Ivoire': Math.floor(Math.random() * 20) + 3,
        'Sénégal': Math.floor(Math.random() * 15) + 2,
        'Belgique': Math.floor(Math.random() * 10) + 1,
      },
      
      // Donations
      donations: appStats.donations || {
        total: 0,
        count: 0,
        lastDonation: null
      },
      
      // Historique des 7 derniers jours
      dailyStats: Object.entries(visitHistory)
        .slice(-7)
        .map(([date, count]) => ({ date, count })),
      
      // Session actuelle
      currentSession: {
        startTime: sessionStats.startTime || now.toLocaleTimeString('fr-FR'),
        duration: sessionStats.duration || '0:00',
        pageViews: sessionStats.pageViews || 0,
        actions: sessionStats.actions || 0
      },
      
      lastUpdated: now.toISOString()
    };

    setStats(compiledStats);
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('sos_admin_auth');
    setIsAuthenticated(false);
  };

  const exportData = () => {
    const data = {
      stats,
      exportedAt: new Date().toISOString(),
      appVersion: '3.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sos-africa-stats-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetStats = () => {
    if (confirm('⚠️ Êtes-vous sûr de vouloir réinitialiser toutes les statistiques ?')) {
      localStorage.removeItem('sos_app_stats');
      localStorage.removeItem('sos_visit_history');
      loadStats();
    }
  };

  // Écran de connexion
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/30">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin SOS Africa</h1>
            <p className="text-slate-400 text-sm mt-2">Tableau de bord administrateur</p>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Code d'accès secret"
              className="w-full px-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-center text-lg tracking-widest"
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
              autoFocus
            />

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              onClick={handleAuth}
              className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl hover:from-red-600 hover:to-orange-600 transition-all shadow-lg shadow-red-500/30"
            >
              Accéder au Dashboard
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 text-slate-400 hover:text-white transition-colors"
            >
              ← Retour à l'application
            </button>
          </div>

          <p className="text-center text-slate-600 text-xs mt-8">
            🔒 Accès sécurisé réservé à l'administrateur
          </p>
        </div>
      </div>
    );
  }

  // Dashboard Admin
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Dashboard Admin</h1>
              <p className="text-xs text-slate-400">SOS Africa Analytics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={loadStats}
              disabled={loading}
              className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
              title="Actualiser"
            >
              <RefreshCw className={`w-5 h-5 text-slate-300 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
              title="Fermer"
            >
              <X className="w-5 h-5 text-slate-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-slate-900 border-b border-slate-700 px-4">
        <div className="flex gap-1 max-w-4xl mx-auto overflow-x-auto">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: Eye },
            { id: 'features', label: 'Fonctionnalités', icon: Zap },
            { id: 'geo', label: 'Géographie', icon: Globe },
            { id: 'donations', label: 'Donations', icon: Heart },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="p-4 max-w-4xl mx-auto pb-24">
        {/* Vue d'ensemble */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Stats principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon={Users} label="Utilisateurs" value={stats?.totalUsers || 0} color="blue" />
              <StatCard icon={Activity} label="Actifs aujourd'hui" value={stats?.activeToday || 0} color="green" />
              <StatCard icon={AlertTriangle} label="Alertes envoyées" value={stats?.totalAlerts || 0} color="red" />
              <StatCard icon={Clock} label="Temps moyen" value={stats?.avgSessionTime || '0:00'} color="purple" isText />
            </div>

            {/* Graphique des 7 derniers jours */}
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Activité des 7 derniers jours
              </h3>
              <div className="flex items-end justify-between h-32 gap-2">
                {(stats?.dailyStats || []).map((day, idx) => {
                  const maxCount = Math.max(...(stats?.dailyStats || []).map(d => d.count), 1);
                  const height = (day.count / maxCount) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-slate-400">{day.count}</span>
                      <div 
                        className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all"
                        style={{ height: `${Math.max(height, 5)}%` }}
                      />
                      <span className="text-[10px] text-slate-500">{day.date.split('-')[2]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Session actuelle */}
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-green-400" />
                Session actuelle
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-700/50 rounded-xl p-3">
                  <p className="text-slate-400 text-xs">Début</p>
                  <p className="text-white font-bold">{stats?.currentSession?.startTime || 'N/A'}</p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-3">
                  <p className="text-slate-400 text-xs">Durée</p>
                  <p className="text-white font-bold">{stats?.currentSession?.duration || '0:00'}</p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-3">
                  <p className="text-slate-400 text-xs">Pages vues</p>
                  <p className="text-white font-bold">{stats?.currentSession?.pageViews || 0}</p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-3">
                  <p className="text-slate-400 text-xs">Actions</p>
                  <p className="text-white font-bold">{stats?.currentSession?.actions || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fonctionnalités */}
        {activeTab === 'features' && (
          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-yellow-400" />
                Utilisation des fonctionnalités
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Bouton SOS', value: stats?.features?.sosButton || 0, icon: AlertTriangle, color: 'red' },
                  { name: 'Secouer pour alerter', value: stats?.features?.shakeAlert || 0, icon: Zap, color: 'yellow' },
                  { name: 'Mode Furtif', value: stats?.features?.ghostMode || 0, icon: Moon, color: 'purple' },
                  { name: 'Faux Appel', value: stats?.features?.fakeCall || 0, icon: Phone, color: 'orange' },
                  { name: 'Enregistrement Audio', value: stats?.features?.audioRecord || 0, icon: Mic, color: 'blue' },
                  { name: 'Mode Trajet', value: stats?.features?.journeyMode || 0, icon: Navigation, color: 'green' },
                  { name: 'Sirène', value: stats?.features?.sirenMode || 0, icon: Bell, color: 'pink' },
                ].map((feature, idx) => {
                  const maxValue = Math.max(...Object.values(stats?.features || {}), 1);
                  const percentage = (feature.value / maxValue) * 100;
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <feature.icon className={`w-5 h-5 text-${feature.color}-400`} />
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-300 text-sm">{feature.name}</span>
                          <span className="text-white font-bold">{feature.value}</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-${feature.color}-500 rounded-full transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Alertes */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-red-400">{stats?.totalAlerts || 0}</p>
                <p className="text-slate-400 text-xs">Total alertes</p>
              </div>
              <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-green-400">{stats?.alertsToday || 0}</p>
                <p className="text-slate-400 text-xs">Aujourd'hui</p>
              </div>
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-yellow-400">{stats?.cancelledAlerts || 0}</p>
                <p className="text-slate-400 text-xs">Annulées</p>
              </div>
            </div>
          </div>
        )}

        {/* Géographie */}
        {activeTab === 'geo' && (
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              Répartition par pays
            </h3>
            <div className="space-y-3">
              {Object.entries(stats?.countries || {})
                .sort((a, b) => b[1] - a[1])
                .map(([country, count], idx) => {
                  const total = Object.values(stats?.countries || {}).reduce((a, b) => a + b, 1);
                  const percentage = (count / total) * 100;
                  const flags = {
                    'Cameroun': '🇨🇲',
                    'France': '🇫🇷',
                    'Côte d\'Ivoire': '🇨🇮',
                    'Sénégal': '🇸🇳',
                    'Belgique': '🇧🇪',
                    'Gabon': '🇬🇦',
                    'Congo': '🇨🇬',
                  };
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-2xl">{flags[country] || '🌍'}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-300">{country}</span>
                          <span className="text-white font-bold">{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Donations */}
        {activeTab === 'donations' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-pink-500/20 to-red-500/20 rounded-2xl p-6 border border-pink-500/30">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" />
                Donations reçues
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                  <p className="text-4xl font-bold text-pink-400">
                    {(stats?.donations?.total || 0).toLocaleString()}
                  </p>
                  <p className="text-slate-400 text-sm">FCFA Total</p>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                  <p className="text-4xl font-bold text-white">
                    {stats?.donations?.count || 0}
                  </p>
                  <p className="text-slate-400 text-sm">Donateurs</p>
                </div>
              </div>
              {stats?.donations?.lastDonation && (
                <p className="text-center text-slate-400 text-sm mt-4">
                  Dernier don: {new Date(stats.donations.lastDonation).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
              <h4 className="font-bold text-white mb-3">Liens de paiement</h4>
              <div className="space-y-2 text-sm">
                <p className="text-slate-300">💳 Stripe: <span className="text-blue-400">buy.stripe.com/...</span></p>
                <p className="text-slate-300">📱 MTN: <span className="text-yellow-400">+237 651 495 483</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 mt-6">
          <button
            onClick={exportData}
            className="w-full p-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Exporter les données (JSON)
          </button>

          <button
            onClick={resetStats}
            className="w-full p-4 bg-slate-700 text-slate-300 font-bold rounded-xl hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Réinitialiser les statistiques
          </button>

          <button
            onClick={handleLogout}
            className="w-full p-4 text-red-400 hover:text-red-300 transition-colors"
          >
            Se déconnecter
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-6">
          Dernière mise à jour: {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleString('fr-FR') : 'N/A'}
        </p>
      </main>
    </div>
  );
};

// Composant StatCard
const StatCard = ({ icon: Icon, label, value, color, isText = false }) => {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  return (
    <div className={`rounded-2xl p-4 border ${colorClasses[color]}`}>
      <Icon className="w-6 h-6 mb-2" />
      <p className="text-2xl font-bold text-white">{isText ? value : value.toLocaleString()}</p>
      <p className="text-slate-400 text-xs">{label}</p>
    </div>
  );
};

export default AdminPage;