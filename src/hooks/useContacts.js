import { useState, useEffect, useCallback } from 'react';
import { Preferences } from '@capacitor/preferences';

const STORAGE_KEY = 'sos_africa_contacts';

/**
 * Hook de gestion des contacts d'urgence
 * Stockage local persistant via Capacitor Preferences
 * Avec support pour l'import depuis le téléphone
 */
export const useContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phoneContacts, setPhoneContacts] = useState([]);
  const [importLoading, setImportLoading] = useState(false);

  // Charger les contacts au démarrage
  useEffect(() => {
    loadContacts();
  }, []);

  // Charger depuis le stockage
  const loadContacts = async () => {
    try {
      // Essayer Capacitor Preferences d'abord
      const { value } = await Preferences.get({ key: STORAGE_KEY });
      
      if (value) {
        setContacts(JSON.parse(value));
      }
    } catch (err) {
      console.log('Fallback vers localStorage');
      // Fallback vers localStorage (web/dev)
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setContacts(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Erreur chargement contacts:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder dans le stockage
  const saveContacts = async (newContacts) => {
    try {
      await Preferences.set({
        key: STORAGE_KEY,
        value: JSON.stringify(newContacts)
      });
    } catch (err) {
      // Fallback localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newContacts));
    }
    setContacts(newContacts);
  };

  // Ajouter un contact
  const addContact = useCallback(async (contact) => {
    const newContact = {
      id: Date.now().toString(),
      name: contact.name.trim(),
      phone: formatPhoneNumber(contact.phone),
      relation: contact.relation || 'Autre',
      priority: contact.priority || contacts.length + 1,
      createdAt: new Date().toISOString()
    };

    const updatedContacts = [...contacts, newContact];
    await saveContacts(updatedContacts);
    
    return newContact;
  }, [contacts]);

  // Mettre à jour un contact
  const updateContact = useCallback(async (id, updates) => {
    const updatedContacts = contacts.map(contact => {
      if (contact.id === id) {
        return {
          ...contact,
          ...updates,
          phone: updates.phone ? formatPhoneNumber(updates.phone) : contact.phone,
          updatedAt: new Date().toISOString()
        };
      }
      return contact;
    });

    await saveContacts(updatedContacts);
  }, [contacts]);

  // Supprimer un contact
  const removeContact = useCallback(async (id) => {
    const updatedContacts = contacts.filter(c => c.id !== id);
    await saveContacts(updatedContacts);
  }, [contacts]);

  // Réorganiser les priorités
  const reorderContacts = useCallback(async (fromIndex, toIndex) => {
    const reordered = [...contacts];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    
    // Mettre à jour les priorités
    const withPriorities = reordered.map((contact, index) => ({
      ...contact,
      priority: index + 1
    }));

    await saveContacts(withPriorities);
  }, [contacts]);

  // Obtenir les contacts par priorité
  const getContactsByPriority = useCallback(() => {
    return [...contacts].sort((a, b) => (a.priority || 999) - (b.priority || 999));
  }, [contacts]);

  // Importer les contacts du téléphone
  const importFromPhone = useCallback(async () => {
    setImportLoading(true);
    
    try {
      // Essayer l'API Contact Picker (navigateurs modernes)
      if ('contacts' in navigator && 'ContactsManager' in window) {
        try {
          const props = ['name', 'tel'];
          const opts = { multiple: true };
          const webContacts = await navigator.contacts.select(props, opts);
          
          const validContacts = webContacts
            .filter(c => c.tel && c.tel.length > 0)
            .map((c, idx) => ({
              id: 'phone_' + idx,
              name: c.name?.[0] || 'Sans nom',
              phone: c.tel[0],
              phones: c.tel
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
          
          setPhoneContacts(validContacts);
          return validContacts;
        } catch (webErr) {
          console.log('Contact Picker non disponible:', webErr);
        }
      }

      // Fallback: simuler des contacts pour la démo
      // En production, utiliser @capacitor-community/contacts
      const mockContacts = [
        { id: 'mock_1', name: 'Exemple Contact 1', phone: '+237612345678' },
        { id: 'mock_2', name: 'Exemple Contact 2', phone: '+237698765432' }
      ];
      
      // Message d'info pour l'utilisateur
      alert('Pour importer vos contacts sur Android, veuillez installer l\'app via l\'APK. Dans le navigateur, vous pouvez ajouter les contacts manuellement.');
      
      setPhoneContacts(mockContacts);
      return mockContacts;

    } catch (err) {
      console.error('Erreur import contacts:', err);
      throw err;
    } finally {
      setImportLoading(false);
    }
  }, []);

  // Ajouter un contact depuis les contacts du téléphone
  const addFromPhoneContact = useCallback(async (phoneContact) => {
    return addContact({
      name: phoneContact.name,
      phone: phoneContact.phone,
      relation: 'autre'
    });
  }, [addContact]);

  // Vérifier si un numéro existe déjà
  const isContactExists = useCallback((phone) => {
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
    return contacts.some(c => c.phone.replace(/[\s\-\(\)]/g, '') === normalizedPhone);
  }, [contacts]);

  return {
    contacts,
    loading,
    phoneContacts,
    importLoading,
    addContact,
    updateContact,
    removeContact,
    reorderContacts,
    getContactsByPriority,
    importFromPhone,
    addFromPhoneContact,
    isContactExists,
    reload: loadContacts
  };
};

// Formater le numéro de téléphone
const formatPhoneNumber = (phone) => {
  // Nettoyer le numéro
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Ajouter le préfixe international si absent
  if (!cleaned.startsWith('+')) {
    // Détecter le format local africain
    if (cleaned.startsWith('0')) {
      // Exemple pour Côte d'Ivoire: 0xxxxxxxxx -> +225xxxxxxxxx
      // L'utilisateur devrait configurer son pays, mais on garde le format local
      cleaned = cleaned;
    }
  }
  
  return cleaned;
};

export default useContacts;