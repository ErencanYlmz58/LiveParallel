import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../../components';
import { COLORS, TEXT, SHADOWS, BORDER_RADIUS } from '../../styles';
import { authActions } from '../../store';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../services/firebase';

// Levensfase opties voor de dropdown
const LIFE_PHASES = [
  'Student',
  'Starter',
  'Mid-career',
  'Leidinggevende',
  'Pensioen',
  'Anders'
];

// Beslissingsstijl opties
const DECISION_STYLES = [
  'Ik neem snel beslissingen',
  'Ik neem de tijd voor beslissingen',
  'Het hangt af van de situatie'
];

// Prioriteiten opties
const PRIORITIES = [
  'Avontuur',
  'Zekerheid',
  'Balans tussen beide'
];

const KnowMeBetter = ({ onClose, visible, userId }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  
  // Form state
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    age: '',
    lifePhase: LIFE_PHASES[0],
  });
  
  const [preferences, setPreferences] = useState({
    decisionStyle: DECISION_STYLES[0],
    futureVision: '',
    priorities: PRIORITIES[0],
    hobby: '',        
    motivation: '',
  });
  
  // Laad bestaande gegevens bij het openen
  useEffect(() => {
    if (visible && userId) {
      loadUserData();
    }
  }, [visible, userId]);
  
  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const userDataRef = doc(firestore, 'userProfiles', userId);
      const docSnap = await getDoc(userDataRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.personalInfo) {
          setPersonalInfo(data.personalInfo);
        }
        if (data.preferences) {
          setPreferences(data.preferences);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Fout', 'Er is een fout opgetreden bij het laden van je gegevens.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveUserData = async () => {
    try {
      setIsLoading(true);
      const userDataRef = doc(firestore, 'userProfiles', userId);
      
      // Check of document al bestaat
      const docSnap = await getDoc(userDataRef);
      
      const userData = {
        personalInfo,
        preferences,
        updatedAt: new Date().toISOString()
      };
      
      if (docSnap.exists()) {
        await updateDoc(userDataRef, userData);
      } else {
        await setDoc(userDataRef, {
          ...userData,
          userId,
          createdAt: new Date().toISOString()
        });
      }
      
      // Update gebruikersprofiel met indicatie dat gegevens zijn ingevuld
      await dispatch(authActions.updateUserProfile({
        hasCompletedKnowMeBetter: true
      }));
      
      Alert.alert('Succes', 'Je gegevens zijn succesvol opgeslagen!');
      onClose();
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert('Fout', 'Er is een fout opgetreden bij het opslaan van je gegevens.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handlers voor form state updates
  const updatePersonalInfo = (field, value) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const updatePreferences = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
// Voeg een constante toe voor het aantal secties
const TOTAL_SECTIONS = 3; // In plaats van 2

// Pas de navigatiefunctie aan
const goToNextSection = () => {
  if (activeSection < TOTAL_SECTIONS - 1) {
    setActiveSection(activeSection + 1);
  } else {
    saveUserData();
  }
};
  
  const goToPreviousSection = () => {
    if (activeSection > 0) {
      setActiveSection(activeSection - 1);
    } else {
      onClose();
    }
  };
  
  // Render de opties voor selecties
  const renderOptions = (options, selectedValue, onSelect) => {
    return (
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedValue === option && styles.selectedOptionButton
            ]}
            onPress={() => onSelect(option)}
          >
            <Text
              style={[
                styles.optionText,
                selectedValue === option && styles.selectedOptionText
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  // Render Persoonlijke Informatie sectie
  const renderPersonalInfoSection = () => {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Persoonlijke Gegevens</Text>
        
        <Input
          label="Naam"
          value={personalInfo.name}
          onChangeText={(text) => updatePersonalInfo('name', text)}
          placeholder="Jouw naam"
          autoCapitalize="words"
        />
        
        <Input
          label="Leeftijd"
          value={personalInfo.age}
          onChangeText={(text) => updatePersonalInfo('age', text)}
          placeholder="Jouw leeftijd"
          keyboardType="number-pad"
        />
        
        <Text style={styles.inputLabel}>Levensfase</Text>
        {renderOptions(
          LIFE_PHASES,
          personalInfo.lifePhase,
          (value) => updatePersonalInfo('lifePhase', value)
        )}
         
      </View>
    );
  };
  
  // Render Voorkeuren sectie
  const renderPreferencesSection = () => {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Jouw Voorkeuren</Text>
        
        <Text style={styles.inputLabel}>Hoe neem jij beslissingen?</Text>
        {renderOptions(
          DECISION_STYLES,
          preferences.decisionStyle,
          (value) => updatePreferences('decisionStyle', value)
        )}
        
        <Input
          label="Waar zie je jezelf over 10 jaar?"
          value={preferences.futureVision}
          onChangeText={(text) => updatePreferences('futureVision', text)}
          placeholder="Beschrijf je ideale toekomst..."
          multiline
          numberOfLines={4}
        />
        
        <Text style={styles.inputLabel}>Wat is belangrijker voor jou?</Text>
        {renderOptions(
          PRIORITIES,
          preferences.priorities,
          (value) => updatePreferences('priorities', value)
        )}
      </View>
    );
  };

  // Voeg een nieuwe render functie toe
const renderHobbiesSection = () => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Je Interesses</Text>
      
      <Input
        label="Wat is je favoriete hobby?"
        value={preferences.hobby}
        onChangeText={(text) => updatePreferences('hobby', text)}
        placeholder="Bijv. lezen, sporten, reizen..."
        multiline
      />
      
      <Input
        label="Wat motiveert jou in het leven?"
        value={preferences.motivation}
        onChangeText={(text) => updatePreferences('motivation', text)}
        placeholder="Wat geeft jou energie en inspiratie?"
        multiline
      />
    </View>
  );
};

  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={goToPreviousSection}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.TEXT} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Leer mij beter kennen</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color={COLORS.TEXT} />
          </TouchableOpacity>
        </View>
        
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeSection === 0 && renderPersonalInfoSection()}
          {activeSection === 1 && renderPreferencesSection()}
          {activeSection === 2 && renderHobbiesSection()}
          
          <View style={styles.progressContainer}>
            <View style={styles.progressIndicators}>
              <View
                style={[
                  styles.progressDot,
                  activeSection >= 0 && styles.activeProgressDot
                ]}
              />
              <View
                style={[
                  styles.progressDot,
                  activeSection >= 1 && styles.activeProgressDot
                ]}
              />
              <View 
                style={[
                  styles.progressDot,
                  activeSection >= 2 && styles.activeProgressDot
                ]}
              />

            </View>
            <Text style={styles.progressText}>
              {activeSection + 1} van {TOTAL_SECTIONS}
            </Text>
          </View>
          
          <Button
  title={activeSection < TOTAL_SECTIONS - 1 ? "Volgende" : "Opslaan"}
  onPress={goToNextSection}
  loading={isLoading}
  disabled={isLoading}
  fullWidth
  style={styles.actionButton}
/>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  headerTitle: {
    ...TEXT.title,
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  closeButton: {
    padding: 8,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...TEXT.title,
    marginBottom: 16,
  },
  inputLabel: {
    ...TEXT.body,
    marginBottom: 8,
    fontWeight: '500',
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionButton: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.md,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  selectedOptionButton: {
    backgroundColor: COLORS.PRIMARY + '10',
    borderColor: COLORS.PRIMARY,
  },
  optionText: {
    ...TEXT.body,
  },
  selectedOptionText: {
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  progressIndicators: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.BORDER,
    marginHorizontal: 4,
  },
  activeProgressDot: {
    backgroundColor: COLORS.PRIMARY,
  },
  progressText: {
    ...TEXT.caption,
    color: COLORS.TEXT_SECONDARY,
  },
  actionButton: {
    marginBottom: 24,
  },
});

export default KnowMeBetter;