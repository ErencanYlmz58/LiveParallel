import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen, RegisterScreen, ForgotPasswordScreen } from '../screens/auth';
import OnboardingFlow from '../screens/auth/OnboardingFlow';
import { COLORS } from '../styles';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.BACKGROUND },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen 
        name="Onboarding" 
        component={OnboardingFlow}
        options={{
          gestureEnabled: false // Voorkom dat gebruikers terug kunnen swipen
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;