import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

// API base URL for mood tracking
const API_URL = "/api/metrics/mood";

// Async thunk to fetch existing mood data
export const fetchExistingMoodData = createAsyncThunk(
  "mood/fetchExistingMoodData",
  async (token, thunkAPI) => {
    try {
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Fetched existing mood data:", response.data);
      return response.data || []; // Return empty array if data is undefined
    } catch (error) {
      const errorMessage = error.response?.data || "Failed to fetch mood data";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to add new mood data
export const addNewMoodData = createAsyncThunk(
  "mood/addNewMoodData",
  async ({ newMoodData, recommendations, token }, thunkAPI) => {
    try {
      console.log("Sending new mood data to the server:", {
        newMoodData,
        recommendations,
      });
      const response = await axios.post(
        API_URL,
        { newMoodData, recommendations },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Server response for adding new mood data:", response.data);
      toast.success("New mood data added successfully");
      return response.data?.data || {};
    } catch (error) {
      const errorMessage =
        error.response?.data || "Failed to add new mood data";
      console.error("Error in addNewMoodData:", errorMessage);
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to update existing mood data
export const updateExistingMoodData = createAsyncThunk(
  "mood/updateExistingMoodData",
  async ({ id, newMoodData, token }, thunkAPI) => {
    try {
      const response = await axios.put(
        `${API_URL}?id=${id}`,
        { newMoodData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Mood data updated successfully");
      return response.data.updatedMoodDataEntry;
    } catch (error) {
      const errorMessage = error.response?.data || "Failed to update mood data";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to delete mood data
export const deleteExistingMoodData = createAsyncThunk(
  "mood/deleteExistingMoodData",
  async ({ id, token }, thunkAPI) => {
    try {
      await axios.delete(API_URL, {
        params: { id },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Mood data deleted successfully");
      return id;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete mood data";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

const moodSlice = createSlice({
  name: "mood",
  initialState: {
    moodData: [], // Updated state name for clarity
    status: "idle",
    loading: false,
    error: null,
  },
  reducers: {
    resetMoodState: (state) => {
      state.moodData = []; // Clear existing mood data
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExistingMoodData.pending, (state) => {
        state.status = "loading";
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExistingMoodData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.moodData = action.payload || []; // Ensure payload is an array
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchExistingMoodData.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = action.payload || "An unknown error occurred"; // Provide a default error message
      })
      .addCase(addNewMoodData.fulfilled, (state, action) => {
        console.log("New Mood Data Added:", action.payload);
        if (!Array.isArray(state.moodData)) {
          state.moodData = [];
        }
        state.moodData = [...state.moodData, action.payload];
        state.status = "succeeded";
        state.loading = false;
        state.error = null;
      })
      .addCase(addNewMoodData.rejected, (state, action) => {
        console.error("Add New Mood Data Rejected:", action.payload);
        state.error = action.payload || "An unknown error occurred"; // Provide a default error message
      })
      .addCase(updateExistingMoodData.fulfilled, (state, action) => {
        if (Array.isArray(state.moodData)) {
          const index = state.moodData.findIndex(
            (entry) => entry._id === action.payload?._id
          );
          if (index !== -1) {
            state.moodData[index] = action.payload || {}; // Ensure payload is an object
          }
        } else {
          state.moodData = []; // Reset to an empty array if not already
        }
      })
      .addCase(deleteExistingMoodData.pending, (state) => {
        state.status = "loading";
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExistingMoodData.fulfilled, (state, action) => {
        if (Array.isArray(state.moodData)) {
          state.moodData = state.moodData.filter(
            (entry) => entry._id !== action.payload
          );
        } else {
          state.moodData = []; // If it's not an array, reset it to an empty array
        }
        state.status = "succeeded";
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteExistingMoodData.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = action.payload || "Failed to delete mood data";
      });
  },
});

export const { resetMoodState } = moodSlice.actions;

export const selectAllMoodData = (state) => state.mood.moodData; // Updated selector name
export const selectMoodDataLoading = (state) => state.mood.loading;
export const selectMoodDataError = (state) => state.mood.error;

export default moodSlice.reducer;
