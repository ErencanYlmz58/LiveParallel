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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../../components';
import { COLORS, TEXT } from '../../styles';
import { validation } from '../../utils';
import { authService } from '../../services';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate email when it changes or is touched
  useEffect(() => {
    if (!validation.isRequired(email)) {
      setError('Email is required');
    } else if (!validation.isValidEmail(email)) {
      setError('Invalid email format');
    } else {
      setError('');
    }
  }, [email]);

  const handleResetPassword = async () => {
    setTouched(true);
    
    // Validate email before submission
    if (!validation.isRequired(email)) {
      setError('Email is required');
      return;
    } else if (!validation.isValidEmail(email)) {
      setError('Invalid email format');
      return;
    }
    
    try {
      setIsLoading(true);
      await authService.resetPassword(email);
      setIsSuccess(true);
    } catch (err) {
      Alert.alert(
        'Password Reset Failed',
        err.message || 'There was an error requesting a password reset. Please try again.'
      );
    } finally {
      setIsLoading(false);
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
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              {isSuccess
                ? `We've sent you an email with password reset instructions. Please check your inbox.`
                : `Enter your email address and we'll send you a link to reset your password.`
              }
            </Text>
          </View>

          {!isSuccess ? (
            <View style={styles.formContainer}>
              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                onBlur={() => setTouched(true)}
                error={touched ? error : null}
                touched={touched}
                keyboardType="email-address"
                autoCapitalize="none"
                textContentType="emailAddress"
              />

              <Button
                title="Send Reset Link"
                onPress={handleResetPassword}
                disabled={isLoading}
                loading={isLoading}
                fullWidth
                style={styles.resetButton}
              />
            </View>
          ) : (
            <Button
              title="Back to Login"
              onPress={() => navigation.navigate('Login')}
              variant="outline"
              fullWidth
              style={styles.backToLoginButton}
            />
          )}
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
  resetButton: {
    marginTop: 16,
  },
  backToLoginButton: {
    marginTop: 24,
  },
});

export default ForgotPasswordScreen;