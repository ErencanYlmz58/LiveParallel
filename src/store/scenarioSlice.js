import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { scenariosService } from '../services';

// Async thunks
export const fetchUserScenarios = createAsyncThunk(
  'scenarios/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const scenarios = await scenariosService.getUserScenarios();
      return scenarios;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchScenario = createAsyncThunk(
  'scenarios/fetchOne',
  async (scenarioId, { rejectWithValue }) => {
    try {
      const scenario = await scenariosService.getScenario(scenarioId);
      return scenario;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createScenario = createAsyncThunk(
  'scenarios/create',
  async (scenarioData, { rejectWithValue }) => {
    try {
      const newScenario = await scenariosService.createScenario(scenarioData);
      return newScenario;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateScenario = createAsyncThunk(
  'scenarios/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const updatedScenario = await scenariosService.updateScenario(id, data);
      return updatedScenario;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteScenario = createAsyncThunk(
  'scenarios/delete',
  async (scenarioId, { rejectWithValue }) => {
    try {
      await scenariosService.deleteScenario(scenarioId);
      return scenarioId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const generateAlternativePath = createAsyncThunk(
  'scenarios/generatePath',
  async (scenarioId, { rejectWithValue }) => {
    try {
      const updatedScenario = await scenariosService.generateAlternativePath(scenarioId);
      return updatedScenario;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  scenarios: [],
  currentScenario: null,
  isLoading: false,
  error: null,
};

// Scenarios slice
const scenarioSlice = createSlice({
  name: 'scenarios',
  initialState,
  reducers: {
    clearCurrentScenario: (state) => {
      state.currentScenario = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all scenarios
      .addCase(fetchUserScenarios.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserScenarios.fulfilled, (state, action) => {
        state.isLoading = false;
        state.scenarios = action.payload;
      })
      .addCase(fetchUserScenarios.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch single scenario
      .addCase(fetchScenario.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchScenario.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentScenario = action.payload;
      })
      .addCase(fetchScenario.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create scenario
      .addCase(createScenario.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createScenario.fulfilled, (state, action) => {
        state.isLoading = false;
        state.scenarios.unshift(action.payload);
        state.currentScenario = action.payload;
      })
      .addCase(createScenario.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update scenario
      .addCase(updateScenario.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateScenario.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update in the scenarios array
        const index = state.scenarios.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.scenarios[index] = action.payload;
        }
        // Update current scenario if it's the same
        if (state.currentScenario && state.currentScenario.id === action.payload.id) {
          state.currentScenario = action.payload;
        }
      })
      .addCase(updateScenario.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete scenario
      .addCase(deleteScenario.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteScenario.fulfilled, (state, action) => {
        state.isLoading = false;
        state.scenarios = state.scenarios.filter(s => s.id !== action.payload);
        if (state.currentScenario && state.currentScenario.id === action.payload) {
          state.currentScenario = null;
        }
      })
      .addCase(deleteScenario.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Generate alternative path
      .addCase(generateAlternativePath.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateAlternativePath.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update in the scenarios array
        const index = state.scenarios.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.scenarios[index] = action.payload;
        }
        // Update current scenario
        state.currentScenario = action.payload;
      })
      .addCase(generateAlternativePath.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentScenario, clearError } = scenarioSlice.actions;
export default scenarioSlice.reducer;