import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

// API base URL for steps
const API_URL = "/api/metrics/steps";

// Async thunk to fetch existing steps data
export const fetchExistingStepsData = createAsyncThunk(
  "steps/fetchExistingStepsData",
  async (token, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Fetched existing steps data:", response.data);
      return response.data || []; // Return empty array if data is undefined
    } catch (error) {
      const errorMessage = error.response?.data || "Failed to fetch steps data";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to add new steps data
export const addNewStepsData = createAsyncThunk(
  "steps/addNewStepsData",
  async ({ newStepsData, token }, thunkAPI) => {
    try {
      console.log("Sending new steps data to the server:", newStepsData);
      const response = await axios.post(
        `${API_URL}`,
        { newStepsData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Server response for adding new steps data:", response.data);
      toast.success("New steps data added successfully");
      return response.data?.data || {};
    } catch (error) {
      const errorMessage =
        error.response?.data || "Failed to add new steps data";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to update existing steps data
export const updateExistingStepsData = createAsyncThunk(
  "steps/updateExistingStepsData",
  async ({ id, updatedStepsData, token }, thunkAPI) => {
    try {
      const response = await axios.put(
        `${API_URL}?id=${id}`,
        { updatedStepsData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Steps data updated successfully");
      return response.data.updatedStepsDataEntry;
    } catch (error) {
      const errorMessage =
        error.response?.data || "Failed to update steps data";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to delete steps data
export const deleteExistingStepsData = createAsyncThunk(
  "steps/deleteExistingStepsData",
  async ({ id, token }, thunkAPI) => {
    try {
      await axios.delete(`${API_URL}`, {
        params: { id }, // Correct way to pass id as query param
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Steps data deleted successfully");
      return id;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete steps data";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

const stepsSlice = createSlice({
  name: "steps",
  initialState: {
    stepsData: [], // Updated state name for clarity
    status: "idle",
    loading: false,
    error: null,
  },
  reducers: {
    resetStepsState: (state) => {
      state.stepsData = []; // Clear existing steps data
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExistingStepsData.pending, (state) => {
        state.status = "loading";
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExistingStepsData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.stepsData = action.payload || []; // Ensure payload is an array
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchExistingStepsData.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = action.payload || "An unknown error occurred"; // Provide a default error message
      })
      .addCase(addNewStepsData.fulfilled, (state, action) => {
        console.log("New Steps Data Added:", action.payload);
        if (!Array.isArray(state.stepsData)) {
          state.stepsData = [];
        }

        state.stepsData = [...state.stepsData, action.payload];
        state.status = "succeeded";
        state.loading = false;
        state.error = null;
      })
      .addCase(addNewStepsData.rejected, (state, action) => {
        console.error("Add New Steps Data Rejected:", action.payload);
        state.error = action.payload || "An unknown error occurred"; // Provide a default error message
      })
      .addCase(updateExistingStepsData.fulfilled, (state, action) => {
        const index = state.stepsData.findIndex(
          (entry) => entry._id === action.payload?._id
        );
        if (index !== -1) {
          state.stepsData[index] = action.payload || {}; // Ensure payload is an object
        }
      })
      .addCase(deleteExistingStepsData.pending, (state) => {
        state.status = "loading";
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExistingStepsData.fulfilled, (state, action) => {
        if (Array.isArray(state.stepsData)) {
          state.stepsData = state.stepsData.filter(
            (entry) => entry._id !== action.payload
          );
        } else {
          state.stepsData = []; // If it's not an array, reset it to an empty array
        }
        state.status = "succeeded";
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteExistingStepsData.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = action.payload || "Failed to delete steps data";
      });
  },
});

export const { resetStepsState } = stepsSlice.actions;

export const selectAllStepsData = (state) => state.steps.stepsData; // Updated selector name
export const selectStepsDataLoading = (state) => state.steps.loading;
export const selectStepsDataError = (state) => state.steps.error;

export default stepsSlice.reducer;
