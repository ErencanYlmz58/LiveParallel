import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Button, Input, ProfileImage, Loading } from '../../components';
import { COLORS, TEXT, SHADOWS, BORDER_RADIUS } from '../../styles';
import { authActions } from '../../store';
import { storageService, profileDataService } from '../../services';
import UserProfileData from './UserProfileData';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector((state) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
  });
  
  // State voor profielgegevens
  const [profileData, setProfileData] = useState(null);
  const [isLoadingProfileData, setIsLoadingProfileData] = useState(false);
  const [completenessScore, setCompletenessScore] = useState(0);

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        bio: user.bio || '',
      });
      
      // Laad gebruikersprofielgegevens
      loadUserProfileData();
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(authActions.clearError());
    }
  }, [error, dispatch]);
  
  const loadUserProfileData = async () => {
    if (!user || !user.uid) return;
    
    try {
      setIsLoadingProfileData(true);
      const data = await profileDataService.getUserProfileData(user.uid);
      
      if (data) {
        setProfileData(data);
        // Haal de volledigheidsscore op of bereken deze
        const score = user.completenessScore || data.completenessScore || calculateCompleteness(data);
        setCompletenessScore(score);
      }
    } catch (error) {
      console.error('Error loading user profile data:', error);
    } finally {
      setIsLoadingProfileData(false);
    }
  };
  
  // Bereken de volledigheidsscore als deze niet in de gegevens zit
  const calculateCompleteness = (data) => {
    if (!data) return 0;
    
    const fields = [];
    
    // Voeg persoonlijke gegevens toe als ze bestaan
    if (data.personalInfo) {
      if (data.personalInfo.age) fields.push(data.personalInfo.age);
      if (data.personalInfo.lifePhase) fields.push(data.personalInfo.lifePhase);
      if (data.personalInfo.lifePhase === 'Anders' && data.personalInfo.customLifePhase) {
        fields.push(data.personalInfo.customLifePhase);
      }
    }
    
    // Voeg voorkeuren toe als ze bestaan
    if (data.preferences) {
      if (data.preferences.decisionStyle) fields.push(data.preferences.decisionStyle);
      if (data.preferences.futureVision) fields.push(data.preferences.futureVision);
      if (data.preferences.priorities) fields.push(data.preferences.priorities);
      if (data.preferences.hobby) fields.push(data.preferences.hobby);
      if (data.preferences.motivation) fields.push(data.preferences.motivation);
    }
    
    // Als er geen velden zijn, return 0
    if (fields.length === 0) return 0;
    
    // Aantal potentiële velden (7 in totaal - name is verwijderd)
    const totalFields = 7;
    
    // Bereken percentage
    return Math.round((fields.length / totalFields) * 100);
  };

  const handleLogout = () => {
    Alert.alert(
      'Uitloggen',
      'Weet je zeker dat je wilt uitloggen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        { 
          text: 'Uitloggen', 
          onPress: () => {
            dispatch(authActions.logoutUser());
          } 
        },
      ]
    );
  };

  const toggleEditMode = () => {
    if (isEditing) {
      // Cancel editing and reset form
      setFormData({
        displayName: user.displayName || '',
        bio: user.bio || '',
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = () => {
    if (!formData.displayName.trim()) {
      Alert.alert('Fout', 'Naam mag niet leeg zijn');
      return;
    }

    dispatch(authActions.updateUserProfile({
      displayName: formData.displayName.trim(),
      bio: formData.bio.trim(),
    }))
      .unwrap()
      .then(() => {
        setIsEditing(false);
        Alert.alert('Gelukt', 'Profiel succesvol bijgewerkt');
      })
      .catch((err) => {
        console.error('Failed to update profile:', err);
      });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePickImage = async () => {
    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Toestemming nodig', 'Geef toegang tot je foto\'s om je profielfoto te wijzigen.');
      return;
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Fout', 'Kan afbeelding niet selecteren');
      console.error('Error picking image:', error);
    }
  };

  const uploadProfileImage = async (uri) => {
    try {
      setIsUploading(true);
      
      // Save image locally instead of uploading to Firebase Storage
      const localUri = await storageService.saveProfileImage(uri);
      
      // Update user profile with new photo URL (local URI)
      await dispatch(authActions.updateUserProfile({ 
        photoURL: localUri,
        photoLocalURI: true
      }));
      
      Alert.alert('Gelukt', 'Profielfoto succesvol bijgewerkt');
    } catch (error) {
      Alert.alert('Fout', 'Kan profielfoto niet bijwerken');
      console.error('Error updating profile image:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleCompleteProfile = () => {
    // Navigeer naar de onboarding flow, maar geef aan dat het vanaf het profiel is
    navigation.navigate('Onboarding', { fromProfile: true });
  };
  
  // Render de volledigheidsscore
  const renderCompletenessScore = () => {
    // Bepaal de kleur op basis van de score
    let scoreColor = COLORS.ERROR;
    if (completenessScore >= 75) {
      scoreColor = COLORS.SUCCESS;
    } else if (completenessScore >= 50) {
      scoreColor = COLORS.PRIMARY;
    } else if (completenessScore >= 25) {
      scoreColor = COLORS.WARNING;
    }
    
    return (
      <View style={styles.completenessContainer}>
        <View style={styles.completenessHeader}>
          <Text style={styles.completenessTitle}>Profielvolledigheid</Text>
          <Text style={[styles.completenessScore, { color: scoreColor }]}>
            {completenessScore}%
          </Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${completenessScore}%`, backgroundColor: scoreColor }]} />
        </View>
        
        {completenessScore < 100 && (
          <TouchableOpacity
            style={styles.completeProfileButton}
            onPress={handleCompleteProfile}
          >
            <Text style={styles.completeProfileButtonText}>Profiel vervolledigen</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (isLoading && !user) {
    return <Loading />;
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Gebruikersinformatie niet beschikbaar</Text>
          <Button
            title="Uitloggen"
            onPress={handleLogout}
            variant="outline"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profiel</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={toggleEditMode}
          >
            <Ionicons 
              name={isEditing ? 'close-outline' : 'create-outline'} 
              size={24} 
              color={COLORS.PRIMARY} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.profileContainer}>
          <View style={styles.profileImageContainer}>
            <ProfileImage
              source={user.photoURL}
              userId={user.uid}
              size={120}
              onPress={handlePickImage}
              editable={!isUploading}
              uploading={isUploading}
            />
          </View>

          {isEditing ? (
            <View style={styles.formContainer}>
              <Input
                label="Naam"
                value={formData.displayName}
                onChangeText={(text) => handleChange('displayName', text)}
                autoCapitalize="words"
                required
              />

              <Input
                label="Bio"
                value={formData.bio}
                onChangeText={(text) => handleChange('bio', text)}
                multiline
                numberOfLines={3}
                autoCapitalize="sentences"
              />

              <Button
                title="Wijzigingen opslaan"
                onPress={handleSaveProfile}
                disabled={isLoading}
                loading={isLoading}
                fullWidth
                style={styles.saveButton}
              />
            </View>
          ) : (
            <View style={styles.infoContainer}>
              <Text style={styles.displayName}>{user.displayName}</Text>
              <Text style={styles.email}>{user.email}</Text>
              
              {user.bio ? (
                <View style={styles.bioContainer}>
                  <Text style={styles.bioTitle}>Bio</Text>
                  <Text style={styles.bioText}>{user.bio}</Text>
                </View>
              ) : null}
            </View>
          )}
        </View>
        
        {/* Volledigheidsscore */}
        {renderCompletenessScore()}
        
        {/* Profielgegevens sectie */}
        {isLoadingProfileData ? (
          <Loading fullScreen={false} size="small" text="Gegevens laden..." />
        ) : profileData ? (
          <UserProfileData 
            profileData={profileData} 
            onEdit={handleCompleteProfile} 
          />
        ) : user.onboardingSkipped ? (
          // Als de gebruiker de onboarding heeft overgeslagen, toon een aanmoediging
          <View style={styles.emptyProfileContainer}>
            <Ionicons name="person-outline" size={50} color={COLORS.PRIMARY} />
            <Text style={styles.emptyProfileTitle}>Vul je profiel aan</Text>
            <Text style={styles.emptyProfileText}>
              Door je profiel aan te vullen kunnen we je ervaring personaliseren.
            </Text>
            <Button
              title="Profiel vervolledigen"
              onPress={handleCompleteProfile}
              style={styles.emptyProfileButton}
            />
          </View>
        ) : null}

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {user.scenarios?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Scenario's</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {user.completedScenarios || 0}
            </Text>
            <Text style={styles.statLabel}>Voltooid</Text>
          </View>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="settings-outline" size={24} color={COLORS.TEXT} style={styles.optionIcon} />
            <Text style={styles.optionText}>Instellingen</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="help-circle-outline" size={24} color={COLORS.TEXT} style={styles.optionIcon} />
            <Text style={styles.optionText}>Help & Ondersteuning</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="star-outline" size={24} color={COLORS.TEXT} style={styles.optionIcon} />
            <Text style={styles.optionText}>Beoordeel de App</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.optionItem, styles.logoutOption]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color={COLORS.ERROR} style={styles.optionIcon} />
            <Text style={[styles.optionText, styles.logoutText]}>Uitloggen</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>LiveParallel v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  headerTitle: {
    ...TEXT.header,
  },
  editButton: {
    padding: 8,
  },
  profileContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
    alignItems: 'center',
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  infoContainer: {
    width: '100%',
    alignItems: 'center',
  },
  displayName: {
    ...TEXT.title,
    marginBottom: 4,
  },
  email: {
    ...TEXT.body,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 16,
  },
  bioContainer: {
    width: '100%',
    marginTop: 8,
  },
  bioTitle: {
    ...TEXT.subtitle,
    marginBottom: 4,
  },
  bioText: {
    ...TEXT.body,
    color: COLORS.TEXT,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  saveButton: {
    marginTop: 16,
  },
  completenessContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  completenessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  completenessTitle: {
    ...TEXT.subtitle,
  },
  completenessScore: {
    ...TEXT.subtitle,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.BORDER,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
  },
  completeProfileButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.PRIMARY + '10',
    borderRadius: BORDER_RADIUS.md,
  },
  completeProfileButtonText: {
    ...TEXT.body,
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },
  emptyProfileContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    ...SHADOWS.small,
    alignItems: 'center',
  },
  emptyProfileTitle: {
    ...TEXT.title,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyProfileText: {
    ...TEXT.body,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyProfileButton: {
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...TEXT.title,
    fontSize: 24,
    color: COLORS.PRIMARY,
  },
  statLabel: {
    ...TEXT.body,
    color: COLORS.TEXT_SECONDARY,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.BORDER,
  },
  optionsContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    ...TEXT.body,
    flex: 1,
  },
  logoutOption: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: COLORS.ERROR,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  versionText: {
    ...TEXT.caption,
    color: COLORS.TEXT_SECONDARY,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    ...TEXT.body,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 16,
  },
});

export default ProfileScreen;