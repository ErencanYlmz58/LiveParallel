import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import * as Haptics from 'expo-haptics';
import { Button, Input } from '../../components';
import { COLORS, TEXT, SHADOWS, BORDER_RADIUS } from '../../styles';
import { profileDataService } from '../../services';
import { authActions } from '../../store';

// Constanten voor de opties
const LIFE_PHASES = [
  'Student',
  'Starter',
  'Mid-career',
  'Leidinggevende',
  'Pensioen',
  'Anders'
];

const DECISION_STYLES = [
  'Ik neem snel beslissingen',
  'Ik neem de tijd voor beslissingen',
  'Het hangt af van de situatie'
];

const PRIORITIES = [
  'Avontuur',
  'Zekerheid',
  'Balans tussen beide'
];

const { width } = Dimensions.get('window');

const OnboardingFlow = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const scrollViewRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Kijk of de onboarding later is gestart vanaf het profiel
  const fromProfile = route?.params?.fromProfile || false;
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showInitialChoice, setShowInitialChoice] = useState(!fromProfile);
  
  // States voor de gebruikersgegevens
  const [personalInfo, setPersonalInfo] = useState({
    age: '',
    lifePhase: null, // Geen standaard selectie
    customLifePhase: '',
  });
  
  const [preferences, setPreferences] = useState({
    decisionStyle: null, // Geen standaard selectie
    futureVision: '',
    priorities: null, // Geen standaard selectie
    hobby: '',
    motivation: '',
  });
  
  // Totaal aantal stappen in de onboarding flow
  const TOTAL_STEPS = 3;
  
  // Laad bestaande gegevens als onboarding vanaf profiel wordt geopend
  useEffect(() => {
    if (fromProfile) {
      loadUserProfileData();
    }
  }, [fromProfile]);
  
  const loadUserProfileData = async () => {
    if (!user || !user.uid) return;
    
    try {
      setIsLoading(true);
      const data = await profileDataService.getUserProfileData(user.uid);
      
      if (data) {
        // Zet de geladen gegevens in de state
        if (data.personalInfo) {
          setPersonalInfo(prev => ({
            ...prev,
            age: data.personalInfo.age || '',
            lifePhase: data.personalInfo.lifePhase || null,
            customLifePhase: data.personalInfo.lifePhase === 'Anders' ? 
                            (data.personalInfo.customLifePhase || '') : '',
          }));
        }
        
        if (data.preferences) {
          setPreferences(prev => ({
            ...prev,
            decisionStyle: data.preferences.decisionStyle || null,
            futureVision: data.preferences.futureVision || '',
            priorities: data.preferences.priorities || null,
            hobby: data.preferences.hobby || '',
            motivation: data.preferences.motivation || '',
          }));
        }
      }
    } catch (error) {
      console.error('Error loading user profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Animeer de overgangen tussen stappen
  const animateToNextSlide = (nextStep) => {
    // Eerst fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep(nextStep);
      
      // Dan slide en fade in
      slideAnim.setValue(0.1 * width);
      fadeAnim.setValue(0);
      
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };
  
  // Bij eerste render, start met een animatie
  useEffect(() => {
    slideAnim.setValue(0.1 * width);
    fadeAnim.setValue(0);
    
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  // Handlers voor gegevens updates
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
  
  // Navigatie tussen stappen
  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      animateToNextSlide(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      animateToNextSlide(currentStep - 1);
    }
  };
  
  const handleChooseFillNow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowInitialChoice(false);
    animateToNextSlide(1); // Begin bij de eerste vraag
  };
  
  const handleChooseFillLater = () => {
    // Sla op dat de gebruiker heeft gekozen om later in te vullen
    dispatch(authActions.updateUserProfile({
      onboardingCompleted: true,
      onboardingSkipped: true,
      completenessScore: 0
    }));
    
    // Navigeer naar de hoofdpagina
    if (fromProfile) {
      // Als we vanaf het profiel komen, ga terug
      navigation.goBack();
    } else {
      // Anders, reset de navigatie naar de hoofdschermen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }
  };
  
  // Toggle selectie voor opties
  const toggleSelection = (field, value, updateFunction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateFunction(field, value === field ? null : value);
  };
  
  // Onboarding voltooien
  const completeOnboarding = async () => {
    try {
      setIsLoading(true);
      
      // Bereken de volledigheidsscore
      const completenessScore = calculateCompleteness();
      
      // Sla de profielgegevens op
      if (user && user.uid) {
        // Verwerk de aangepaste optie voor levensfase
        const finalPersonalInfo = { ...personalInfo };
        if (personalInfo.lifePhase === 'Anders' && personalInfo.customLifePhase) {
          finalPersonalInfo.customLifePhase = personalInfo.customLifePhase;
        }
        
        await profileDataService.saveUserProfileData({
          personalInfo: finalPersonalInfo,
          preferences,
          completenessScore
        }, user.uid);
        
        // Update de gebruikersgegevens in Redux
        await dispatch(authActions.updateUserProfile({
          onboardingCompleted: true,
          onboardingSkipped: false,
          completenessScore
        }));
      }
      
      // Navigeer terug naar het profiel of naar de hoofdpagina
      if (fromProfile) {
        navigation.goBack();
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert(
        "Fout bij opslaan",
        "Er is een probleem opgetreden bij het opslaan van je gegevens. Probeer het later opnieuw."
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // Bereken de volledigheidsscore (percentage)
  const calculateCompleteness = () => {
    const fields = [
      personalInfo.age, 
      personalInfo.lifePhase,
      personalInfo.lifePhase === 'Anders' ? personalInfo.customLifePhase : "filled",
      preferences.decisionStyle,
      preferences.futureVision,
      preferences.priorities,
      preferences.hobby,
      preferences.motivation
    ];
    
    const filledFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  };
  
  // Render opties voor selecties
  const renderOptions = (options, selectedValue, field, updateFunction) => {
    return (
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedValue === option && styles.selectedOptionButton
            ]}
            onPress={() => toggleSelection(field, option, updateFunction)}
          >
            <Text
              style={[
                styles.optionText,
                selectedValue === option && styles.selectedOptionText
              ]}
            >
              {option}
            </Text>
            {selectedValue === option && (
              <Ionicons name="checkmark-circle" size={20} color={COLORS.PRIMARY} style={styles.optionIcon} />
            )}
          </TouchableOpacity>
        ))}
        
        {/* Toon tekstveld voor 'Anders' optie indien geselecteerd */}
        {field === 'lifePhase' && selectedValue === 'Anders' && (
          <TextInput
            style={styles.customInput}
            placeholder="Vul je eigen optie in..."
            value={personalInfo.customLifePhase}
            onChangeText={(text) => updatePersonalInfo('customLifePhase', text)}
          />
        )}
      </View>
    );
  };
  
  // Render de initiële keuzestap (nu of later invullen)
  const renderInitialChoiceStep = () => (
    <Animated.View 
      style={[
        styles.stepContainer,
        { transform: [{ translateX: slideAnim }], opacity: fadeAnim }
      ]}
    >
      <View style={styles.welcomeIconContainer}>
        <Ionicons name="person-circle-outline" size={80} color={COLORS.PRIMARY} />
      </View>
      
      <Text style={styles.welcomeTitle}>Welkom bij LiveParallel!</Text>
      <Text style={styles.welcomeText}>
        We willen je graag beter leren kennen, zodat we je alternatieve levenspaden kunnen personaliseren.
      </Text>
      <Text style={styles.welcomeSubtext}>
        Wil je je profiel nu invullen of later?
      </Text>
      
      <View style={styles.choiceButtonsContainer}>
        <Button
          title="Nu invullen"
          onPress={handleChooseFillNow}
          style={styles.choiceButton}
        />
        <Button
          title="Later invullen"
          onPress={handleChooseFillLater}
          variant="outline"
          style={styles.choiceButton}
        />
      </View>
    </Animated.View>
  );
  
  // Render persoonlijke informatie stap
  const renderPersonalInfoStep = () => (
    <Animated.View 
      style={[
        styles.stepContainer,
        { transform: [{ translateX: slideAnim }], opacity: fadeAnim }
      ]}
    >
      <Text style={styles.stepTitle}>Persoonlijke gegevens</Text>
      
      <Input
        label="Hoe oud ben je?"
        value={personalInfo.age}
        onChangeText={(text) => updatePersonalInfo('age', text)}
        placeholder="Jouw leeftijd"
        keyboardType="number-pad"
      />
      
      <Text style={styles.inputLabel}>In welke levensfase bevind je je?</Text>
      {renderOptions(
        LIFE_PHASES,
        personalInfo.lifePhase,
        'lifePhase',
        updatePersonalInfo
      )}
    </Animated.View>
  );
  
  // Render voorkeuren stap
  const renderPreferencesStep = () => (
    <Animated.View 
      style={[
        styles.stepContainer,
        { transform: [{ translateX: slideAnim }], opacity: fadeAnim }
      ]}
    >
      <Text style={styles.stepTitle}>Jouw voorkeuren</Text>
      
      <Text style={styles.inputLabel}>Hoe neem jij beslissingen?</Text>
      {renderOptions(
        DECISION_STYLES,
        preferences.decisionStyle,
        'decisionStyle',
        updatePreferences
      )}
      
      <Input
        label="Waar zie je jezelf over 10 jaar?"
        value={preferences.futureVision}
        onChangeText={(text) => updatePreferences('futureVision', text)}
        placeholder="Beschrijf je ideale toekomst..."
        multiline
        numberOfLines={3}
      />
      
      <Text style={styles.inputLabel}>Wat is belangrijker voor jou?</Text>
      {renderOptions(
        PRIORITIES,
        preferences.priorities,
        'priorities',
        updatePreferences
      )}
    </Animated.View>
  );
  
  // Render interesses stap
  const renderInterestsStep = () => (
    <Animated.View 
      style={[
        styles.stepContainer,
        { transform: [{ translateX: slideAnim }], opacity: fadeAnim }
      ]}
    >
      <Text style={styles.stepTitle}>Jouw interesses</Text>
      
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
        numberOfLines={3}
      />
    </Animated.View>
  );
  
  // Render huidige stap
  const renderCurrentStep = () => {
    // Als we de initiële keuze moeten tonen
    if (showInitialChoice && currentStep === 0) {
      return renderInitialChoiceStep();
    }
    
    // Anders, toon de juiste stap
    switch (currentStep) {
      case 0:
        return renderInitialChoiceStep();
      case 1:
        return renderPersonalInfoStep();
      case 2:
        return renderPreferencesStep();
      case 3:
        return renderInterestsStep();
      default:
        return null;
    }
  };
  
  // Render voortgangsindicator
  const renderProgressBar = () => {
    // Als we op de initiële keuze zijn, toon geen progressbar
    if (showInitialChoice && currentStep === 0) {
      return null;
    }
    
    const progressPercentage = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBarContainer}>
          <View 
            style={[styles.progressBar, { width: `${progressPercentage}%` }]} 
          />
        </View>
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressText}>
            {`${currentStep - 1}/${TOTAL_STEPS - 1}`}
          </Text>
        </View>
      </View>
    );
  };
  
  // Render navigatieknoppen
  const renderNavigationButtons = () => {
    // Bij de initiële keuze, toon geen navigatieknoppen (die zijn al in de inhoud)
    if (showInitialChoice && currentStep === 0) {
      return null;
    }
    
    return (
      <View style={styles.navigationContainer}>
        {currentStep > 1 ? (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handlePrevious}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.PRIMARY} />
          </TouchableOpacity>
        ) : (
          <View style={styles.buttonPlaceholder} />
        )}
        
        <Button
          title={currentStep === TOTAL_STEPS ? "Voltooien" : "Volgende"}
          onPress={handleNext}
          loading={isLoading}
          disabled={isLoading}
          style={styles.nextButton}
        />
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {renderProgressBar()}
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderCurrentStep()}
        </ScrollView>
      </KeyboardAvoidingView>
      
      {renderNavigationButtons()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  progressContainer: {
    padding: 16,
    paddingBottom: 0,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: COLORS.BORDER,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
  },
  progressTextContainer: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  progressText: {
    ...TEXT.caption,
    color: COLORS.TEXT_SECONDARY,
  },
  stepContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  welcomeIconContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  welcomeTitle: {
    ...TEXT.header,
    textAlign: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    ...TEXT.body,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  welcomeSubtext: {
    ...TEXT.body,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  choiceButtonsContainer: {
    marginTop: 16,
    gap: 16,
  },
  choiceButton: {
    width: '100%',
  },
  stepTitle: {
    ...TEXT.title,
    marginBottom: 24,
  },
  inputLabel: {
    ...TEXT.body,
    marginBottom: 8,
    fontWeight: '500',
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.md,
    padding: 16,
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
    flex: 1,
  },
  selectedOptionText: {
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },
  optionIcon: {
    marginLeft: 8,
  },
  customInput: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.md,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    marginTop: 8,
    ...TEXT.body,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    backgroundColor: COLORS.BACKGROUND,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  buttonPlaceholder: {
    width: 50,
  },
  nextButton: {
    width: 120,
  },
});

export default OnboardingFlow;