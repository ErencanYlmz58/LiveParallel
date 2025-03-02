import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../../components';
import { COLORS, TEXT } from '../../styles';
import { validation } from '../../utils';
import { authActions } from '../../store';

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Clear any previous auth errors
    if (error) {
      dispatch(authActions.clearError());
    }
  }, [dispatch]);

  useEffect(() => {
    // Show error alert if login fails
    if (error) {
      Alert.alert('Login Failed', error);
    }
  }, [error]);

  // Validate form when inputs change or are touched
  useEffect(() => {
    const validationErrors = validation.validateLoginForm(formData);
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
      email: true,
      password: true,
    });

    // Check if form is valid
    const validationErrors = validation.validateLoginForm(formData);
    setErrors(validationErrors);

    // If no errors, proceed with login
    if (Object.keys(validationErrors).length === 0) {
      dispatch(authActions.loginUser({
        email: formData.email,
        password: formData.password,
      }));
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  const navigateToForgotPassword = () => {
    navigation.navigate('ForgotPassword');
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
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>LiveParallel</Text>
            <Text style={styles.tagline}>Explore your alternative life</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

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
              autoCompleteType="email"
              textContentType="emailAddress"
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(text) => handleChange('password', text)}
              onBlur={() => handleBlur('password')}
              error={touched.password ? errors.password : null}
              touched={touched.password}
              secureTextEntry
              autoCapitalize="none"
              textContentType="password"
            />

            <TouchableOpacity
              onPress={navigateToForgotPassword}
              style={styles.forgotPasswordContainer}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleSubmit}
              disabled={isLoading}
              loading={isLoading}
              fullWidth
              style={styles.loginButton}
            />

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account?</Text>
              <TouchableOpacity onPress={navigateToRegister}>
                <Text style={styles.signupLink}>Sign Up</Text>
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
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  appName: {
    ...TEXT.header,
    color: COLORS.PRIMARY,
    marginBottom: 8,
  },
  tagline: {
    ...TEXT.body,
    color: COLORS.TEXT_SECONDARY,
  },
  formContainer: {
    width: '100%',
  },
  title: {
    ...TEXT.header,
    marginBottom: 8,
  },
  subtitle: {
    ...TEXT.body,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 24,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    ...TEXT.body,
    color: COLORS.PRIMARY,
  },
  loginButton: {
    marginBottom: 24,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    ...TEXT.body,
    color: COLORS.TEXT_SECONDARY,
    marginRight: 4,
  },
  signupLink: {
    ...TEXT.body,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
});

export default LoginScreen;