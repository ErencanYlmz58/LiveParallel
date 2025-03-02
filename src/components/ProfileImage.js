import React, { useEffect, useState } from 'react';
import { 
  View, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../styles';
import { storageService } from '../services';

const DEFAULT_PROFILE_IMAGE = require('../../assets/images/default-profile.png');

const ProfileImage = ({
  source,
  userId,
  size = 100,
  onPress,
  editable = false,
  uploading = false,
  style,
}) => {
  const [imageURI, setImageURI] = useState(null);

  useEffect(() => {
    const fetchLocalImage = async () => {
      // If source is provided and is a local URI, use it directly
      if (source && source.startsWith('file://')) {
        setImageURI(source);
        return;
      }
      
      // Otherwise, try to get the image from local storage
      if (userId) {
        const localURI = await storageService.getProfileImage(userId);
        if (localURI) {
          setImageURI(localURI);
        }
      }
    };

    fetchLocalImage();
  }, [source, userId]);

  // Calculate inner styles based on size prop
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const iconContainerStyle = {
    width: size / 3,
    height: size / 3,
    borderRadius: size / 6,
    bottom: 0,
    right: 0,
  };

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle, style]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Image
        source={imageURI ? { uri: imageURI } : DEFAULT_PROFILE_IMAGE}
        style={[styles.image, containerStyle]}
        resizeMode="cover"
      />
      
      {uploading && (
        <View style={[styles.loadingOverlay, containerStyle]}>
          <ActivityIndicator size="small" color={COLORS.BACKGROUND} />
        </View>
      )}
      
      {editable && !uploading && (
        <View style={[styles.editIconContainer, iconContainerStyle]}>
          <Ionicons name="camera" size={size / 6} color={COLORS.BACKGROUND} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: COLORS.BORDER,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  editIconContainer: {
    position: 'absolute',
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.BACKGROUND,
  },
});

export default ProfileImage;