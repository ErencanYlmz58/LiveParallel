import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    serverTimestamp 
  } from 'firebase/firestore';
  import { getFirebaseFirestore, getFirebaseAuth } from './firebase';
  
  // Get Firebase Firestore instance
  const firestore = getFirebaseFirestore();
  const auth = getFirebaseAuth();
  
  /**
   * Create a new scenario
   * @param {Object} scenarioData - Data for the new scenario
   * @returns {Promise<Object>} - The created scenario with ID
   */
  export const createScenario = async (scenarioData) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is logged in');
      }
      
      // Create a reference to the scenarios collection
      const scenariosCollectionRef = collection(firestore, 'scenarios');
      
      // Prepare scenario data with additional fields
      const scenarioToCreate = {
        ...scenarioData,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'pending' // pending, generating, completed
      };
      
      // Add the document to Firestore
      const docRef = await addDoc(scenariosCollectionRef, scenarioToCreate);
      
      // Get the newly created document
      const scenarioSnapshot = await getDoc(docRef);
      
      // Return the scenario data with ID
      return {
        id: scenarioSnapshot.id,
        ...scenarioSnapshot.data(),
        createdAt: scenarioSnapshot.data().createdAt.toDate().toISOString(),
        updatedAt: scenarioSnapshot.data().updatedAt.toDate().toISOString()
      };
    } catch (error) {
      console.error('Error creating scenario:', error);
      throw error;
    }
  };
  
  /**
   * Get a scenario by ID
   * @param {string} scenarioId - ID of the scenario to get
   * @returns {Promise<Object>} - The scenario data
   */
  export const getScenario = async (scenarioId) => {
    try {
      // Get the scenario document
      const scenarioRef = doc(firestore, 'scenarios', scenarioId);
      const scenarioSnapshot = await getDoc(scenarioRef);
      
      if (!scenarioSnapshot.exists()) {
        throw new Error('Scenario not found');
      }
      
      // Format timestamp fields
      const data = scenarioSnapshot.data();
      
      return {
        id: scenarioSnapshot.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting scenario:', error);
      throw error;
    }
  };
  
  /**
   * Get all scenarios for the current user
   * @returns {Promise<Array>} - Array of scenario objects
   */
  export const getUserScenarios = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is logged in');
      }
      
      // Create a query to get all scenarios for the user
      const scenariosQuery = query(
        collection(firestore, 'scenarios'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      // Execute the query
      const scenariosSnapshot = await getDocs(scenariosQuery);
      
      // Map the documents to an array of scenario objects
      const scenarios = scenariosSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString()
        };
      });
      
      return scenarios;
    } catch (error) {
      console.error('Error getting user scenarios:', error);
      throw error;
    }
  };
  
  /**
   * Update a scenario
   * @param {string} scenarioId - ID of the scenario to update
   * @param {Object} updateData - New data for the scenario
   * @returns {Promise<Object>} - The updated scenario
   */
  export const updateScenario = async (scenarioId, updateData) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is logged in');
      }
      
      // Get the scenario to check if it belongs to the user
      const scenarioRef = doc(firestore, 'scenarios', scenarioId);
      const scenarioSnapshot = await getDoc(scenarioRef);
      
      if (!scenarioSnapshot.exists()) {
        throw new Error('Scenario not found');
      }
      
      const scenarioData = scenarioSnapshot.data();
      
      // Check if the scenario belongs to the current user
      if (scenarioData.userId !== user.uid) {
        throw new Error('You do not have permission to update this scenario');
      }
      
      // Prepare the update data
      const dataToUpdate = {
        ...updateData,
        updatedAt: serverTimestamp()
      };
      
      // Update the document
      await updateDoc(scenarioRef, dataToUpdate);
      
      // Get the updated document
      const updatedScenarioSnapshot = await getDoc(scenarioRef);
      const updatedData = updatedScenarioSnapshot.data();
      
      return {
        id: updatedScenarioSnapshot.id,
        ...updatedData,
        createdAt: updatedData.createdAt?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: updatedData.updatedAt?.toDate().toISOString() || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error updating scenario:', error);
      throw error;
    }
  };
  
  /**
   * Delete a scenario
   * @param {string} scenarioId - ID of the scenario to delete
   * @returns {Promise<boolean>} - True if deletion was successful
   */
  export const deleteScenario = async (scenarioId) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is logged in');
      }
      
      // Get the scenario to check if it belongs to the user
      const scenarioRef = doc(firestore, 'scenarios', scenarioId);
      const scenarioSnapshot = await getDoc(scenarioRef);
      
      if (!scenarioSnapshot.exists()) {
        throw new Error('Scenario not found');
      }
      
      const scenarioData = scenarioSnapshot.data();
      
      // Check if the scenario belongs to the current user
      if (scenarioData.userId !== user.uid) {
        throw new Error('You do not have permission to delete this scenario');
      }
      
      // Delete the document
      await deleteDoc(scenarioRef);
      
      return true;
    } catch (error) {
      console.error('Error deleting scenario:', error);
      throw error;
    }
  };
  
  /**
   * Generate an alternative life path for a scenario
   * @param {string} scenarioId - ID of the scenario to generate a path for
   * @returns {Promise<Object>} - The updated scenario with alternative path
   */
  export const generateAlternativePath = async (scenarioId) => {
    try {
      // First, update the scenario status to 'generating'
      await updateScenario(scenarioId, { status: 'generating' });
      
      // Simulate AI generation with timeout
      // In a real implementation, this would call an AI service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Example alternative path generation (placeholder)
      const alternativePath = {
        events: [
          {
            title: 'New career path',
            description: 'You decided to follow your passion instead of the secure job.',
            outcome: 'You started your own business and found both purpose and financial success.',
            timestamp: new Date().toISOString()
          },
          {
            title: 'Relationship changes',
            description: 'Your new career introduced you to different social circles.',
            outcome: 'You met someone who truly appreciates your ambition and creativity.',
            timestamp: new Date().toISOString()
          },
          {
            title: 'Personal growth',
            description: 'The challenges of your new path pushed you to develop new skills.',
            outcome: 'You discovered hidden talents and strengths you never knew you had.',
            timestamp: new Date().toISOString()
          }
        ],
        summary: 'Your alternative path led to greater fulfillment and unexpected opportunities. While it came with challenges, the journey strengthened your character and expanded your horizons.'
      };
      
      // Update the scenario with the generated path
      return await updateScenario(scenarioId, {
        alternativePath,
        status: 'completed'
      });
    } catch (error) {
      console.error('Error generating alternative path:', error);
      
      // Update the scenario status to 'error'
      try {
        await updateScenario(scenarioId, { status: 'error' });
      } catch (updateError) {
        console.error('Error updating scenario status after generation failure:', updateError);
      }
      
      throw error;
    }
  };
  
  export default {
    createScenario,
    getScenario,
    getUserScenarios,
    updateScenario,
    deleteScenario,
    generateAlternativePath
  };