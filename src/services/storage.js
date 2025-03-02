import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { getFirebaseAuth, getFirebaseFirestore } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';

// Get Firebase instances
const auth = getFirebaseAuth();
const firestore = getFirebaseFirestore();

/**
 * Save image locally and return a local URI
 * @param {string} uri - URI of the image (from camera or gallery)
 * @param {string} filename - Name for the saved file
 * @returns {Promise<string>} - Local URI of the saved image
 */
export const saveImageLocally = async (uri, filename) => {
  try {
    // Create a unique filename
    const timestamp = new Date().getTime();
    const localUri = `${FileSystem.documentDirectory}${filename}_${timestamp}.jpg`;
    
    // Copy the image file to local storage
    await FileSystem.copyAsync({
      from: uri,
      to: localUri
    });
    
    return localUri;
  } catch (error) {
    console.error('Error saving image locally:', error);
    throw error;
  }
};

/**
 * Save profile image locally and update user profile
 * @param {string} uri - URI of the image
 * @returns {Promise<string>} - Local URI of the saved profile image
 */
export const saveProfileImage = async (uri) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is logged in');
    }
    
    // Save image to local storage
    const localUri = await saveImageLocally(uri, `profile_${user.uid}`);
    
    // Save URI to user's AsyncStorage for persistence across app restarts
    await AsyncStorage.setItem(`@profile_image_${user.uid}`, localUri);
    
    // Update Firestore with the local URI reference (for multi-device scenarios)
    const userRef = doc(firestore, 'users', user.uid);
    await updateDoc(userRef, {
      photoURL: localUri,
      photoLocalURI: true // Flag to indicate this is a local URI, not a remote URL
    });
    
    return localUri;
  } catch (error) {
    console.error('Error saving profile image:', error);
    throw error;
  }
};

/**
 * Get profile image from local storage
 * @param {string} uid - User ID
 * @returns {Promise<string|null>} - Local URI of the profile image or null if not found
 */
export const getProfileImage = async (uid) => {
  try {
    const user = auth.currentUser;
    const userId = uid || user?.uid;
    
    if (!userId) {
      return null;
    }
    
    // Try to get the image URI from AsyncStorage
    const localUri = await AsyncStorage.getItem(`@profile_image_${userId}`);
    
    // Verify the file exists
    if (localUri) {
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (fileInfo.exists) {
        return localUri;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting profile image:', error);
    return null;
  }
};

/**
 * Save scenario image locally
 * @param {string} uri - URI of the image
 * @param {string} scenarioId - ID of the scenario
 * @returns {Promise<string>} - Local URI of the saved scenario image
 */
export const saveScenarioImage = async (uri, scenarioId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is logged in');
    }
    
    // Save image to local storage
    const localUri = await saveImageLocally(uri, `scenario_${scenarioId}`);
    
    return localUri;
  } catch (error) {
    console.error('Error saving scenario image:', error);
    throw error;
  }
};

export default {
  saveImageLocally,
  saveProfileImage,
  getProfileImage,
  saveScenarioImage
};