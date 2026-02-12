import React, { useState } from 'react';
import { 
  Clock, MapPin, Trash2, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle, XCircle, ExternalLink,
  BarChart3, Calendar, Filter
} from 'lucide-react';

const AlertHistoryTab = ({ historyHook, onClose }) => {
  const {
    alerts,
    isLoading,
    deleteAlert,
    clearHistory,
    getStats,
    formatDate,
    getAlertTypeInfo
  } = historyHook;

  const [showStats, setShowStats] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [confirmClear, setConfirmClear] = useState(false);
  const [expandedAlert, setExpandedAlert] = useState(null);

  const stats = getStats();

  // Filtrer les alertes
  const filteredAlerts = filterType === 'all' 
    ? alerts 
    : alerts.filter(a => a.type === filterType);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-400" />
          Historique des alertes
        </h2>
        {alerts.length > 0 && (
          <button
            onClick={() => setConfirmClear(true)}
            className="text-red-400 text-sm hover:text-red-300"
          >
            Tout effacer
          </button>
        )}
      </div>

      {/* Statistiques */}
      {alerts.length > 0 && (
        <div className="bg-slate-800 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowStats(!showStats)}
            className="w-full p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">Statistiques</span>
            </div>
            {showStats ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {showStats && (
            <div className="px-4 pb-4 grid grid-cols-3 gap-3">
              <div className="bg-slate-900 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-slate-400">Total</p>
              </div>
              <div className="bg-slate-900 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-400">{stats.thisMonth}</p>
                <p className="text-xs text-slate-400">Ce mois</p>
              </div>
              <div className="bg-slate-900 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-400">{stats.thisWeek}</p>
                <p className="text-xs text-slate-400">Cette semaine</p>
              </div>

              {/* Par type */}
              <div className="col-span-3 grid grid-cols-4 gap-2 mt-2">
                <div className="bg-red-500/20 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-red-400">{stats.byType.sos}</p>
                  <p className="text-[10px] text-slate-400">SOS</p>
                </div>
                <div className="bg-orange-500/20 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-orange-400">{stats.byType.shake}</p>
                  <p className="text-[10px] text-slate-400">Secousse</p>
                </div>
                <div className="bg-blue-500/20 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-blue-400">{stats.byType.journey}</p>
                  <p className="text-[10px] text-slate-400">Trajet</p>
                </div>
                <div className="bg-purple-500/20 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-purple-400">{stats.byType.community}</p>
                  <p className="text-[10px] text-slate-400">Réseau</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filtres */}
      {alerts.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { value: 'all', label: 'Tout', icon: '📋' },
            { value: 'sos', label: 'SOS', icon: '🆘' },
            { value: 'shake', label: 'Secousse', icon: '📳' },
            { value: 'journey', label: 'Trajet', icon: '🚶' },
            { value: 'community', label: 'Réseau', icon: '🌍' }
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterType(filter.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filterType === filter.value
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {filter.icon} {filter.label}
            </button>
          ))}
        </div>
      )}

      {/* Liste des alertes */}
      {filteredAlerts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-white font-medium mb-2">
            {alerts.length === 0 ? 'Aucune alerte' : 'Aucun résultat'}
          </h3>
          <p className="text-slate-400 text-sm">
            {alerts.length === 0 
              ? 'Vos alertes envoyées apparaîtront ici'
              : 'Essayez un autre filtre'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const typeInfo = getAlertTypeInfo(alert.type);
            const isExpanded = expandedAlert === alert.id;

            return (
              <div 
                key={alert.id}
                className="bg-slate-800 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
                  className="w-full p-4 flex items-center gap-4"
                >
                  {/* Icône */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl
                    ${alert.cancelled 
                      ? 'bg-slate-700' 
                      : typeInfo.color === 'red' ? 'bg-red-500/20' 
                      : typeInfo.color === 'orange' ? 'bg-orange-500/20'
                      : typeInfo.color === 'blue' ? 'bg-blue-500/20'
                      : 'bg-purple-500/20'
                    }`}
                  >
                    {typeInfo.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium">{typeInfo.label}</p>
                      {alert.cancelled && (
                        <span className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded">
                          Annulé
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm">{formatDate(alert.timestamp)}</p>
                  </div>

                  {/* Chevron */}
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                {/* Détails */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-700 pt-3 space-y-3">
                    {/* Contacts notifiés */}
                    {alert.contactsNotified > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400">Contacts notifiés:</span>
                        <span className="text-white">{alert.contactsNotified}</span>
                        {alert.contactsList && alert.contactsList.length > 0 && (
                          <span className="text-slate-500">
                            ({alert.contactsList.join(', ')})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Méthode */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-400">Méthode:</span>
                      <span className="text-white capitalize">{alert.method}</span>
                    </div>

                    {/* Position */}
                    {alert.location && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-400">
                            {alert.location.lat.toFixed(4)}, {alert.location.lng.toFixed(4)}
                          </span>
                        </div>
                        <a
                          href={`https://www.google.com/maps?q=${alert.location.lat},${alert.location.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 text-sm flex items-center gap-1"
                        >
                          Voir <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {/* Annulation */}
                    {alert.cancelled && alert.cancelledAt && (
                      <div className="flex items-center gap-2 text-sm text-orange-400">
                        <XCircle className="w-4 h-4" />
                        Annulé le {formatDate(alert.cancelledAt)}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAlert(alert.id);
                        }}
                        className="text-red-400 text-sm flex items-center gap-1 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation effacer tout */}
      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80"
            onClick={() => setConfirmClear(false)}
          />
          <div className="relative bg-slate-800 rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Effacer l'historique ?</h3>
              <p className="text-slate-400 text-sm mb-6">
                Cette action est irréversible. Toutes les {alerts.length} alertes seront supprimées.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmClear(false)}
                  className="flex-1 py-3 bg-slate-700 text-white font-medium rounded-xl"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    clearHistory();
                    setConfirmClear(false);
                  }}
                  className="flex-1 py-3 bg-red-600 text-white font-medium rounded-xl"
                >
                  Effacer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertHistoryTab;