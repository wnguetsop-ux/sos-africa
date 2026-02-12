import React, { useState } from 'react';
import { 
  Mic, MicOff, Square, Pause, Play, Trash2, 
  Share2, Download, Clock, AlertCircle, 
  CheckCircle, ChevronDown, ChevronUp 
} from 'lucide-react';
import { useAudioRecording } from '../hooks/useAudioRecording';

const AudioRecordingTab = ({ isPremium, onUpgradeNeeded }) => {
  const {
    isRecording,
    isPaused,
    formattedDuration,
    recordings,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    deleteRecording,
    shareRecording,
    formatDuration
  } = useAudioRecording();

  const [showHistory, setShowHistory] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Démarrer l'enregistrement avec vérification premium
  const handleStartRecording = async () => {
    if (!isPremium) {
      onUpgradeNeeded?.('recording');
      return;
    }
    await startRecording();
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">
          🎙️ Enregistrement Discret
        </h2>
        <p className="text-slate-400 text-sm">
          Enregistrez discrètement en cas de danger
        </p>
      </div>

      {/* Indicateur d'erreur */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Bouton principal d'enregistrement */}
      <div className="flex flex-col items-center py-8">
        {!isRecording ? (
          <button
            onClick={handleStartRecording}
            className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-red-700 
                       flex items-center justify-center shadow-lg shadow-red-500/30
                       hover:from-red-400 hover:to-red-600 transition-all
                       active:scale-95"
          >
            <Mic className="w-12 h-12 text-white" />
          </button>
        ) : (
          <div className="relative">
            {/* Animation de pulsation */}
            <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
            <div className="w-32 h-32 rounded-full bg-red-600 flex items-center justify-center relative">
              <div className="text-center">
                <MicOff className="w-8 h-8 text-white mx-auto mb-1" />
                <span className="text-white font-mono text-lg">{formattedDuration}</span>
              </div>
            </div>
          </div>
        )}

        {/* Label */}
        <p className="mt-4 text-slate-300 text-sm">
          {isRecording 
            ? (isPaused ? 'En pause' : 'Enregistrement en cours...') 
            : 'Appuyez pour enregistrer'}
        </p>

        {!isPremium && !isRecording && (
          <div className="mt-3 px-4 py-2 bg-yellow-500/20 rounded-full">
            <span className="text-yellow-400 text-sm">⭐ Fonctionnalité Premium</span>
          </div>
        )}
      </div>

      {/* Contrôles pendant l'enregistrement */}
      {isRecording && (
        <div className="flex justify-center gap-4">
          {/* Pause/Resume */}
          <button
            onClick={isPaused ? resumeRecording : pauseRecording}
            className="p-4 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"
          >
            {isPaused ? (
              <Play className="w-6 h-6 text-green-400" />
            ) : (
              <Pause className="w-6 h-6 text-yellow-400" />
            )}
          </button>

          {/* Stop */}
          <button
            onClick={stopRecording}
            className="p-4 bg-red-600 rounded-full hover:bg-red-500 transition-colors"
          >
            <Square className="w-6 h-6 text-white" />
          </button>
        </div>
      )}

      {/* Conseils */}
      {!isRecording && (
        <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
          <h3 className="text-white font-medium text-sm">💡 Conseils d'utilisation</h3>
          <ul className="text-slate-400 text-xs space-y-1">
            <li>• L'enregistrement continue même si vous verrouillez l'écran</li>
            <li>• Gardez le téléphone dans votre poche pour un son discret</li>
            <li>• Les enregistrements sont sauvegardés automatiquement</li>
            <li>• Maximum 5 minutes (30 min avec Premium Pro)</li>
          </ul>
        </div>
      )}

      {/* Historique des enregistrements */}
      <div className="bg-slate-900 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/50"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            <span className="text-white font-medium">Historique</span>
            <span className="bg-slate-700 px-2 py-0.5 rounded-full text-xs text-slate-300">
              {recordings.length}
            </span>
          </div>
          {showHistory ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {showHistory && (
          <div className="border-t border-slate-800">
            {recordings.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                Aucun enregistrement
              </div>
            ) : (
              <div className="divide-y divide-slate-800 max-h-64 overflow-y-auto">
                {recordings.map((recording) => (
                  <div key={recording.id} className="p-3 hover:bg-slate-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-white text-sm">
                          {new Date(recording.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-slate-400 text-xs">
                          Durée: {formatDuration(recording.duration)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Lecture */}
                        {recording.url && (
                          <audio 
                            src={recording.url} 
                            controls 
                            className="h-8 w-24"
                          />
                        )}

                        {/* Partager */}
                        <button
                          onClick={() => shareRecording(recording.id)}
                          className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        {/* Supprimer */}
                        {confirmDelete === recording.id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                deleteRecording(recording.id);
                                setConfirmDelete(null);
                              }}
                              className="p-2 text-red-400 hover:text-red-300"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="p-2 text-slate-400 hover:text-white"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(recording.id)}
                            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecordingTab;