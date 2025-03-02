import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged
  } from 'firebase/auth';
  import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { getFirebaseAuth, getFirebaseFirestore } from './firebase';
  import { getProfileImage } from './storage';
  
  // Get Firebase instances
  const auth = getFirebaseAuth();
  const firestore = getFirebaseFirestore();
  
  // Register new user
  export const registerUser = async (email, password, displayName) => {
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update the user's profile with the display name
      await updateProfile(user, { displayName });
      
      // Create a user document in Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName,
        createdAt: new Date().toISOString(),
        scenarios: []
      });
      
      return user;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  };
  
  // Login user
  export const loginUser = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  };
  
  // Logout user
  export const logoutUser = async () => {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      console.error('Error logging out user:', error);
      throw error;
    }
  };
  
  // Reset password
  export const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };
  
  // Update user profile
  export const updateUserProfile = async (userData) => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('No user is currently signed in');
      }
      
      // Update auth profile if we have displayName
      if (userData.displayName) {
        await updateProfile(user, {
          displayName: userData.displayName
        });
      }
      
      // Update user document in Firestore
      const userRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        await updateDoc(userRef, userData);
      }
      
      return user;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };
  
  // Get current user
  export const getCurrentUser = () => {
    return auth.currentUser;
  };
  
  // Get user profile data
  export const getUserProfile = async (uid) => {
    try {
      const userId = uid || auth.currentUser?.uid;
      
      if (!userId) {
        throw new Error('User ID not provided and no user is logged in');
      }
      
      const userRef = doc(firestore, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Check if profile image is stored locally
        if (userData.photoLocalURI) {
          const localPhotoURI = await getProfileImage(userId);
          if (localPhotoURI) {
            userData.photoURL = localPhotoURI;
          }
        }
        
        return userData;
      } else {
        throw new Error('User profile not found');
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  };
  
  // Listen to auth state changes
  export const onAuthStateChange = (callback) => {
    return onAuthStateChanged(auth, callback);
  };
  
  export default {
    registerUser,
    loginUser,
    logoutUser,
    resetPassword,
    updateUserProfile,
    getCurrentUser,
    getUserProfile,
    onAuthStateChange
  };