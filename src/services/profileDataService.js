import { 
    collection, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc,
    query,
    where,
    getDocs,
    serverTimestamp 
  } from 'firebase/firestore';
  import { getFirebaseFirestore, getFirebaseAuth } from './firebase';
  
  // Get Firebase instances
  const firestore = getFirebaseFirestore();
  const auth = getFirebaseAuth();
  
  /**
   * Gets the user profile data
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} User profile data or null if not found
   */
  export const getUserProfileData = async (userId) => {
    try {
      const user = auth.currentUser;
      if (!user && !userId) {
        throw new Error('No user is logged in');
      }
      
      const uid = userId || user.uid;
      const userProfileRef = doc(firestore, 'userProfiles', uid);
      const docSnap = await getDoc(userProfileRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user profile data:', error);
      throw error;
    }
  };
  
  /**
   * Save user profile data
   * @param {Object} profileData - The profile data to save
   * @param {string} userId - Optional User ID (uses current user by default)
   * @returns {Promise<Object>} The saved profile data
   */
  export const saveUserProfileData = async (profileData, userId) => {
    try {
      const user = auth.currentUser;
      if (!user && !userId) {
        throw new Error('No user is logged in');
      }
      
      const uid = userId || user.uid;
      const userProfileRef = doc(firestore, 'userProfiles', uid);
      
      // Check if document already exists
      const docSnap = await getDoc(userProfileRef);
      
      // Prepare data with timestamps
      const dataToSave = {
        ...profileData,
        updatedAt: serverTimestamp()
      };
      
      if (docSnap.exists()) {
        // Update existing document
        await updateDoc(userProfileRef, dataToSave);
      } else {
        // Create new document
        await setDoc(userProfileRef, {
          ...dataToSave,
          userId: uid,
          createdAt: serverTimestamp()
        });
      }
      
      // Return the saved data (get the document again to include server timestamps)
      const updatedDocSnap = await getDoc(userProfileRef);
      return updatedDocSnap.data();
    } catch (error) {
      console.error('Error saving user profile data:', error);
      throw error;
    }
  };
  
  /**
   * Find similar profiles based on user preferences
   * This is a placeholder for future AI recommendation functionality
   * @param {string} userId - User ID to find similar profiles for
   * @returns {Promise<Array>} Array of similar user profiles
   */
  export const findSimilarProfiles = async (userId) => {
    try {
      const userProfileData = await getUserProfileData(userId);
      
      if (!userProfileData || !userProfileData.preferences) {
        return [];
      }
      
      // In a real implementation, this would use more sophisticated matching
      // This is a simple example that could be expanded with AI later
      const { priorities } = userProfileData.preferences;
      
      // Find users with the same priorities
      const profilesRef = collection(firestore, 'userProfiles');
      const q = query(
        profilesRef,
        where('preferences.priorities', '==', priorities),
        where('userId', '!=', userId)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error finding similar profiles:', error);
      return [];
    }
  };
  
  export default {
    getUserProfileData,
    saveUserProfileData,
    findSimilarProfiles
  };