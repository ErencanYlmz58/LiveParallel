import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../../components';
import { COLORS, TEXT } from '../../styles';
import { validation } from '../../utils';
import { authActions } from '../../store';

const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState({
    displayName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Clear any previous auth errors
    if (error) {
      dispatch(authActions.clearError());
    }
  }, [dispatch]);

  useEffect(() => {
    // Show error alert if registration fails
    if (error) {
      Alert.alert('Registration Failed', error);
    }
  }, [error]);

  // Validate form when inputs change or are touched
  useEffect(() => {
    const validationErrors = validation.validateRegisterForm(formData);
    setErrors(validationErrors);
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  const handleSubmit = () => {
    // Mark all fields as touched
    setTouched({
      displayName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    // Check if form is valid
    const validationErrors = validation.validateRegisterForm(formData);
    setErrors(validationErrors);

    // If no errors, proceed with registration
    if (Object.keys(validationErrors).length === 0) {
      dispatch(authActions.registerUser({
        displayName: formData.displayName,
        email: formData.email,
        password: formData.password,
      }));
    }
  };

  const navigateBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={navigateBack}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.TEXT} />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to start exploring parallel lives</Text>
          </View>

          <View style={styles.formContainer}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.displayName}
              onChangeText={(text) => handleChange('displayName', text)}
              onBlur={() => handleBlur('displayName')}
              error={touched.displayName ? errors.displayName : null}
              touched={touched.displayName}
              autoCapitalize="words"
              textContentType="name"
            />

            <Input
              label="Email"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              onBlur={() => handleBlur('email')}
              error={touched.email ? errors.email : null}
              touched={touched.email}
              keyboardType="email-address"
              autoCapitalize="none"
              textContentType="emailAddress"
            />

            <Input
              label="Password"
              placeholder="Choose a password"
              value={formData.password}
              onChangeText={(text) => handleChange('password', text)}
              onBlur={() => handleBlur('password')}
              error={touched.password ? errors.password : null}
              touched={touched.password}
              secureTextEntry
              autoCapitalize="none"
              textContentType="newPassword"
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={(text) => handleChange('confirmPassword', text)}
              onBlur={() => handleBlur('confirmPassword')}
              error={touched.confirmPassword ? errors.confirmPassword : null}
              touched={touched.confirmPassword}
              secureTextEntry
              autoCapitalize="none"
              textContentType="newPassword"
            />

            <Button
              title="Create Account"
              onPress={handleSubmit}
              disabled={isLoading}
              loading={isLoading}
              fullWidth
              style={styles.registerButton}
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <TouchableOpacity onPress={navigateBack}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  backButton: {
    marginTop: 16,
    marginBottom: 24,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    ...TEXT.header,
    marginBottom: 8,
  },
  subtitle: {
    ...TEXT.body,
    color: COLORS.TEXT_SECONDARY,
  },
  formContainer: {
    width: '100%',
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    ...TEXT.body,
    color: COLORS.TEXT_SECONDARY,
    marginRight: 4,
  },
  loginLink: {
    ...TEXT.body,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;