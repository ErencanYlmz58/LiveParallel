import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Button, Input, ProfileImage, Loading } from '../../components';
import { COLORS, TEXT, SHADOWS, BORDER_RADIUS } from '../../styles';
import { authActions } from '../../store';
import { storageService, profileDataService } from '../../services';
import KnowMeBetter from './KnowMeBetter';
import UserProfileData from './UserProfileData';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector((state) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
  });
  
  // State voor "Leer mij beter kennen" functionaliteit
  const [knowMeBetterVisible, setKnowMeBetterVisible] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isLoadingProfileData, setIsLoadingProfileData] = useState(false);

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
      }
    } catch (error) {
      console.error('Error loading user profile data:', error);
    } finally {
      setIsLoadingProfileData(false);
    }
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
  
  const handleOpenKnowMeBetter = () => {
    setKnowMeBetterVisible(true);
  };
  
  const handleCloseKnowMeBetter = () => {
    setKnowMeBetterVisible(false);
    // Herlaad profielgegevens na sluiten
    loadUserProfileData();
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
        
        {/* "Leer mij beter kennen" sectie */}
        {isLoadingProfileData ? (
          <Loading fullScreen={false} size="small" text="Gegevens laden..." />
        ) : profileData ? (
          <UserProfileData 
            profileData={profileData} 
            onEdit={handleOpenKnowMeBetter} 
          />
        ) : (
          <View style={styles.knowMeBetterContainer}>
            <Text style={styles.knowMeBetterTitle}>Vertel me meer over jezelf</Text>
            <Text style={styles.knowMeBetterText}>
              Beantwoord enkele vragen zodat we je app-ervaring kunnen personaliseren
            </Text>
            <Button
              title="Leer mij beter kennen"
              onPress={handleOpenKnowMeBetter}
              variant="outline"
              fullWidth
              style={styles.knowMeBetterButton}
            />
          </View>
        )}

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
      
      {/* "Leer mij beter kennen" Modal */}
      <KnowMeBetter
        visible={knowMeBetterVisible}
        onClose={handleCloseKnowMeBetter}
        userId={user.uid}
      />
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
  knowMeBetterContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.lg,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.small,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY + '30', // 30% opacity
    borderStyle: 'dashed',
  },
  knowMeBetterTitle: {
    ...TEXT.title,
    marginBottom: 8,
  },
  knowMeBetterText: {
    ...TEXT.body,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 16,
  },
  knowMeBetterButton: {
    marginTop: 8,
  },
});

export default ProfileScreen;