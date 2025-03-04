import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services';

// Async thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ email, password, displayName }, { rejectWithValue }) => {
    try {
      const user = await authService.registerUser(email, password, displayName);
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        onboardingCompleted: false,  // Nieuwe gebruikers hebben onboarding nog niet voltooid
        onboardingSkipped: false,    // Nieuwe gebruikers hebben onboarding nog niet overgeslagen
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const user = await authService.loginUser(email, password);
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logoutUser();
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      // Get current user
      const user = authService.getCurrentUser();
      
      if (!user) {
        return null;
      }
      
      // Get additional profile data from Firestore
      const userProfile = await authService.getUserProfile(user.uid);
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || userProfile.displayName,
        photoURL: user.photoURL || userProfile.photoURL,
        onboardingCompleted: userProfile.onboardingCompleted || false,
        onboardingSkipped: userProfile.onboardingSkipped || false,
        completenessScore: userProfile.completenessScore || 0,
        ...userProfile
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const user = await authService.updateUserProfile(userData);
      
      // Get updated profile data
      const userProfile = await authService.getUserProfile(user.uid);
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        ...userProfile
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setOnboardingCompleted: (state, action) => {
      if (state.user) {
        state.user.onboardingCompleted = action.payload;
      }
    },
    setOnboardingSkipped: (state, action) => {
      if (state.user) {
        state.user.onboardingSkipped = action.payload;
      }
    },
    setCompletenessScore: (state, action) => {
      if (state.user) {
        state.user.completenessScore = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  setUser, 
  clearError, 
  setOnboardingCompleted, 
  setOnboardingSkipped,
  setCompletenessScore
} = authSlice.actions;

export default authSlice.reducer;