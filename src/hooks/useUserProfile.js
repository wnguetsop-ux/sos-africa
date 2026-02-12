import { useState, useEffect, useCallback } from 'react';

/**
 * Hook pour gérer le profil utilisateur
 * Stocke les infos personnelles pour les alertes
 */
export const useUserProfile = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bloodType: '',
    allergies: '',
    medicalConditions: '',
    emergencyInfo: '',
    photoUrl: null,
    dateOfBirth: '',
    gender: '',
    language: 'fr',
    theme: 'dark'
  });
  
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Charger le profil au démarrage
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const stored = localStorage.getItem('sos_user_profile');
      if (stored) {
        const data = JSON.parse(stored);
        setProfile(data.profile || {});
        setIsOnboardingComplete(data.onboardingComplete || false);
      }
    } catch (err) {
      console.error('Erreur chargement profil:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Sauvegarder le profil
  const saveProfile = useCallback(async (newProfile) => {
    try {
      const updatedProfile = { ...profile, ...newProfile };
      setProfile(updatedProfile);
      
      localStorage.setItem('sos_user_profile', JSON.stringify({
        profile: updatedProfile,
        onboardingComplete: isOnboardingComplete,
        updatedAt: new Date().toISOString()
      }));
      
      return true;
    } catch (err) {
      console.error('Erreur sauvegarde profil:', err);
      return false;
    }
  }, [profile, isOnboardingComplete]);

  // Compléter l'onboarding
  const completeOnboarding = useCallback(async (profileData) => {
    try {
      const updatedProfile = { ...profile, ...profileData };
      setProfile(updatedProfile);
      setIsOnboardingComplete(true);
      
      localStorage.setItem('sos_user_profile', JSON.stringify({
        profile: updatedProfile,
        onboardingComplete: true,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      return true;
    } catch (err) {
      console.error('Erreur completion onboarding:', err);
      return false;
    }
  }, [profile]);

  // Réinitialiser l'onboarding (pour tests)
  const resetOnboarding = useCallback(() => {
    localStorage.removeItem('sos_user_profile');
    setProfile({
      firstName: '',
      lastName: '',
      phone: '',
      bloodType: '',
      allergies: '',
      medicalConditions: '',
      emergencyInfo: '',
      photoUrl: null,
      dateOfBirth: '',
      gender: '',
      language: 'fr',
      theme: 'dark'
    });
    setIsOnboardingComplete(false);
  }, []);

  // Changer le thème
  const setTheme = useCallback((theme) => {
    saveProfile({ theme });
  }, [saveProfile]);

  // Changer la langue
  const setLanguage = useCallback((language) => {
    saveProfile({ language });
  }, [saveProfile]);

  // Obtenir le nom complet pour les alertes
  const getFullName = useCallback(() => {
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    return profile.firstName || profile.lastName || 'Utilisateur SOS Africa';
  }, [profile]);

  // Générer le message d'alerte personnalisé
  const generateAlertMessage = useCallback((location) => {
    const name = getFullName();
    const mapsLink = location 
      ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
      : "Position GPS indisponible";
    
    const accuracy = location ? `${Math.round(location.accuracy)}m` : "N/A";
    
    let message = `🆘 URGENCE SOS AFRICA!\n\n`;
    message += `👤 ${name} a besoin d'aide!\n\n`;
    message += `📍 Position: ${mapsLink}\n`;
    message += `📏 Précision: ${accuracy}\n`;
    message += `⏰ Heure: ${new Date().toLocaleString('fr-FR')}\n`;
    
    if (profile.phone) {
      message += `📞 Tél: ${profile.phone}\n`;
    }
    
    if (profile.bloodType) {
      message += `🩸 Groupe sanguin: ${profile.bloodType}\n`;
    }
    
    if (profile.allergies) {
      message += `⚠️ Allergies: ${profile.allergies}\n`;
    }
    
    if (profile.medicalConditions) {
      message += `🏥 Conditions médicales: ${profile.medicalConditions}\n`;
    }
    
    if (profile.emergencyInfo) {
      message += `ℹ️ Info: ${profile.emergencyInfo}\n`;
    }
    
    message += `\nCe message a été envoyé automatiquement via SOS Africa.`;
    
    return message;
  }, [profile, getFullName]);

  return {
    profile,
    isOnboardingComplete,
    isLoading,
    saveProfile,
    completeOnboarding,
    resetOnboarding,
    setTheme,
    setLanguage,
    getFullName,
    generateAlertMessage
  };
};

export default useUserProfile;