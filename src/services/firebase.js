import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuratie
const firebaseConfig = {
    apiKey: "AIzaSyDaF7e2w1rG90neLOPjO-i7npeoAMsWVNo",
    authDomain: "liveparallel-cc235.firebaseapp.com",
    projectId: "liveparallel-cc235",
    storageBucket: "liveparallel-cc235.firebasestorage.app",
    messagingSenderId: "1002799785140",
    appId: "1:1002799785140:web:490690ae3f14a37db163e1",
    measurementId: "G-XQSEE90ERT"
};

// Firebase initialiseren
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, auth, firestore, storage };

// Voor backward compatibility met bestaande code
export const getFirebaseApp = () => app;
export const getFirebaseAuth = () => auth;
export const getFirebaseFirestore = () => firestore;
export const getFirebaseStorage = () => storage;

export default {
  app,
  auth,
  firestore,
  storage,
  getFirebaseApp,
  getFirebaseAuth,
  getFirebaseFirestore,
  getFirebaseStorage
};