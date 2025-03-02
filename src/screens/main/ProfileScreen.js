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
import { COLORS, TEXT, SHADOWS } from '../../styles';
import { authActions } from '../../store';
import { storageService } from '../../services';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector((state) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(authActions.clearError());
    }
  }, [error, dispatch]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
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
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    dispatch(authActions.updateUserProfile({
      displayName: formData.displayName.trim(),
      bio: formData.bio.trim(),
    }))
      .unwrap()
      .then(() => {
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
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
      Alert.alert('Permission Required', 'Please allow access to your photos to change your profile picture.');
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
      Alert.alert('Error', 'Failed to pick image');
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
      
      Alert.alert('Success', 'Profile picture updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile picture');
      console.error('Error updating profile image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading && !user) {
    return <Loading />;
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User information not available</Text>
          <Button
            title="Logout"
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
          <Text style={styles.headerTitle}>Profile</Text>
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
                label="Name"
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
                title="Save Changes"
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

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {user.scenarios?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Scenarios</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {user.completedScenarios || 0}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="settings-outline" size={24} color={COLORS.TEXT} style={styles.optionIcon} />
            <Text style={styles.optionText}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="help-circle-outline" size={24} color={COLORS.TEXT} style={styles.optionIcon} />
            <Text style={styles.optionText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="star-outline" size={24} color={COLORS.TEXT} style={styles.optionIcon} />
            <Text style={styles.optionText}>Rate the App</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.optionItem, styles.logoutOption]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color={COLORS.ERROR} style={styles.optionIcon} />
            <Text style={[styles.optionText, styles.logoutText]}>Logout</Text>
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