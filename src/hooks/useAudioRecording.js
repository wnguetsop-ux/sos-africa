import { useState, useRef, useCallback, useEffect } from 'react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

/**
 * Hook pour l'enregistrement audio discret
 * Permet d'enregistrer en arrière-plan sans interface visible
 */
export const useAudioRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordings, setRecordings] = useState([]);
  const [error, setError] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Charger les enregistrements sauvegardés
  useEffect(() => {
    loadRecordings();
  }, []);

  // Timer de durée
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording, isPaused]);

  // Charger les enregistrements depuis le stockage
  const loadRecordings = async () => {
    try {
      const stored = localStorage.getItem('sos_recordings');
      if (stored) {
        setRecordings(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Erreur chargement enregistrements:', err);
    }
  };

  // Sauvegarder la liste des enregistrements
  const saveRecordingsList = (list) => {
    localStorage.setItem('sos_recordings', JSON.stringify(list));
    setRecordings(list);
  };

  // Démarrer l'enregistrement
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      // Demander l'accès au microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      // Créer le MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
      
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType,
        audioBitsPerSecond: 128000
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        await saveRecording();
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('Erreur MediaRecorder:', event.error);
        setError('Erreur d\'enregistrement');
        stopRecording();
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Chunk toutes les secondes
      
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      
      // Vibration discrète de confirmation
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
      
      return true;
    } catch (err) {
      console.error('Erreur démarrage enregistrement:', err);
      if (err.name === 'NotAllowedError') {
        setError('Permission microphone refusée');
      } else if (err.name === 'NotFoundError') {
        setError('Aucun microphone trouvé');
      } else {
        setError('Impossible de démarrer l\'enregistrement');
      }
      return false;
    }
  }, []);

  // Mettre en pause
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  }, [isRecording]);

  // Reprendre
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  // Arrêter l'enregistrement
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      // Arrêter le stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      setIsRecording(false);
      setIsPaused(false);
      
      // Vibration de confirmation
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }
  }, [isRecording]);

  // Sauvegarder l'enregistrement
  const saveRecording = async () => {
    if (audioChunksRef.current.length === 0) return;
    
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const timestamp = Date.now();
      const fileName = `sos_recording_${timestamp}.webm`;
      
      // Convertir en base64 pour stockage
      const base64 = await blobToBase64(audioBlob);
      
      // Sauvegarder via Capacitor Filesystem si disponible
      try {
        await Filesystem.writeFile({
          path: `recordings/${fileName}`,
          data: base64,
          directory: Directory.Data,
          recursive: true
        });
      } catch (fsError) {
        console.log('Filesystem non disponible, stockage local uniquement');
      }
      
      // Ajouter à la liste
      const newRecording = {
        id: timestamp,
        fileName,
        date: new Date().toISOString(),
        duration: duration,
        size: audioBlob.size,
        base64: base64.substring(0, 100) + '...' // Stocker un aperçu
      };
      
      // Créer URL pour lecture
      newRecording.url = URL.createObjectURL(audioBlob);
      
      // Stocker le blob complet en mémoire temporaire
      window.tempRecordings = window.tempRecordings || {};
      window.tempRecordings[timestamp] = audioBlob;
      
      const updatedList = [newRecording, ...recordings].slice(0, 50); // Max 50 enregistrements
      saveRecordingsList(updatedList);
      
      audioChunksRef.current = [];
      
    } catch (err) {
      console.error('Erreur sauvegarde enregistrement:', err);
      setError('Erreur de sauvegarde');
    }
  };

  // Supprimer un enregistrement
  const deleteRecording = useCallback(async (id) => {
    try {
      const recording = recordings.find(r => r.id === id);
      if (recording) {
        // Supprimer du filesystem
        try {
          await Filesystem.deleteFile({
            path: `recordings/${recording.fileName}`,
            directory: Directory.Data
          });
        } catch (fsError) {
          console.log('Fichier non trouvé dans filesystem');
        }
        
        // Supprimer de la mémoire
        if (window.tempRecordings && window.tempRecordings[id]) {
          URL.revokeObjectURL(window.tempRecordings[id]);
          delete window.tempRecordings[id];
        }
      }
      
      const updatedList = recordings.filter(r => r.id !== id);
      saveRecordingsList(updatedList);
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  }, [recordings]);

  // Partager un enregistrement
  const shareRecording = useCallback(async (id) => {
    const recording = recordings.find(r => r.id === id);
    if (!recording) return;
    
    try {
      const blob = window.tempRecordings?.[id];
      if (blob && navigator.share) {
        const file = new File([blob], recording.fileName, { type: 'audio/webm' });
        await navigator.share({
          files: [file],
          title: 'Enregistrement SOS Africa',
          text: `Enregistrement du ${new Date(recording.date).toLocaleString('fr-FR')}`
        });
      } else {
        // Fallback: télécharger
        const url = recording.url || URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = recording.fileName;
        a.click();
      }
    } catch (err) {
      console.error('Erreur partage:', err);
    }
  }, [recordings]);

  // Formater la durée
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    isRecording,
    isPaused,
    duration,
    formattedDuration: formatDuration(duration),
    recordings,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    deleteRecording,
    shareRecording,
    formatDuration
  };
};

// Utilitaire: Blob vers Base64
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export default useAudioRecording;