import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import Loading from '../components/Loading';
import { authService } from '../services';
import { authActions } from '../store';

const RootNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

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

  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
};

export default RootNavigator;