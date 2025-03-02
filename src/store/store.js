import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import scenarioReducer from './scenarioSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    scenarios: scenarioReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state
        ignoredActions: ['auth/fetchProfile/fulfilled'],
        ignoredPaths: ['auth.user.createdAt', 'auth.user.updatedAt'],
      },
    }),
});

export default store;