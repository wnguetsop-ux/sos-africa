// Firebase initialization for SOS Africa
// Public web config — Firebase web API keys are not secrets.
// Real security is enforced via Firestore Security Rules + App Check.
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyA2vTg4Twj0qCSxwxb_Jy1RDU8_eygr_Bo',
  authDomain: 'sos-africa.firebaseapp.com',
  projectId: 'sos-africa',
  storageBucket: 'sos-africa.firebasestorage.app',
  messagingSenderId: '500807651493',
  appId: '1:500807651493:web:12336e486075dc3e057d4c',
};

// Lazy single-init pattern (HMR-safe)
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export default firebaseApp;
