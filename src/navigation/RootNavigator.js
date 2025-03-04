import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import OnboardingFlow from '../screens/auth/OnboardingFlow';
import Loading from '../components/Loading';
import { authService } from '../services';
import { authActions } from '../store';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = authService.onAuthStateChange(async (user) => {
      if (user) {
        // User is signed in, fetch profile data
        dispatch(authActions.fetchUserProfile());
      } else {
        // User is signed out
        dispatch(authActions.setUser(null));
      }
    });

    // Clean up listener on unmount
    return () => unsubscribe();
  }, [dispatch]);

  if (isLoading) {
    return <Loading />;
  }

  // Controleer of onboarding moet worden weergegeven
  // De gebruiker moet zijn ingelogd (isAuthenticated) maar nog geen onboarding hebben voltooid (user.onboardingCompleted !== true)
  const showOnboarding = isAuthenticated && user && user.onboardingCompleted !== true;

  // Als de gebruiker geauthenticeerd is maar geen onboarding heeft voltooid, toon de onboarding flow
  // Anders, toon de AuthNavigator of MainNavigator afhankelijk van authenticatie status
  if (showOnboarding) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingFlow} />
        <Stack.Screen name="Main" component={MainNavigator} />
      </Stack.Navigator>
    );
  }

  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
};

export default RootNavigator