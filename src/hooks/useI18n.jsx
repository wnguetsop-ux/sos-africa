import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import translations from '../i18n/translations';

// Contexte pour les traductions
const I18nContext = createContext(null);

/**
 * Hook pour gérer les traductions et la langue
 */
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context) return context;
  
  // Fallback si utilisé hors du provider
  const [language, setLanguageState] = useState('fr');
  
  useEffect(() => {
    const stored = localStorage.getItem('sos_language');
    if (stored && (stored === 'fr' || stored === 'en')) {
      setLanguageState(stored);
    }
  }, []);
  
  const setLanguage = useCallback((lang) => {
    if (lang === 'fr' || lang === 'en') {
      setLanguageState(lang);
      localStorage.setItem('sos_language', lang);
    }
  }, []);
  
  const t = useCallback((key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        // Fallback au français si la clé n'existe pas
        value = translations['fr'];
        for (const k2 of keys) {
          if (value && value[k2]) {
            value = value[k2];
          } else {
            return key; // Retourne la clé si non trouvée
          }
        }
        break;
      }
    }
    
    return typeof value === 'string' ? value : key;
  }, [language]);
  
  return { language, setLanguage, t, translations: translations[language] };
};

// Provider pour le contexte i18n
export const I18nProvider = ({ children }) => {
  const [language, setLanguageState] = useState('fr');
  
  useEffect(() => {
    const stored = localStorage.getItem('sos_language');
    if (stored && (stored === 'fr' || stored === 'en')) {
      setLanguageState(stored);
    }
  }, []);
  
  const setLanguage = useCallback((lang) => {
    if (lang === 'fr' || lang === 'en') {
      setLanguageState(lang);
      localStorage.setItem('sos_language', lang);
    }
  }, []);
  
  const t = useCallback((key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        value = translations['fr'];
        for (const k2 of keys) {
          if (value && value[k2]) {
            value = value[k2];
          } else {
            return key;
          }
        }
        break;
      }
    }
    
    return typeof value === 'string' ? value : key;
  }, [language]);
  
  return (
    <I18nContext.Provider value={{ language, setLanguage, t, translations: translations[language] }}>
      {children}
    </I18nContext.Provider>
  );
};

export default useI18n;