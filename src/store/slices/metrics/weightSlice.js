import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

// API base URL for weight
const API_URL = "/api/metrics/weight";

// Async thunk to fetch existing weight data
export const fetchExistingWeightData = createAsyncThunk(
  "weight/fetchExistingWeightData",
  async (token, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Fetched existing weight data:", response.data);
      return response.data || []; // Return empty array if data is undefined
    } catch (error) {
      const errorMessage =
        error.response?.data || "Failed to fetch weight data";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to add new weight data
export const addNewWeightData = createAsyncThunk(
  "weight/addNewWeightData",
  async ({ newWeightData, recommendations, token }, thunkAPI) => {
    console.log("This is the token log in the weight slice:", token);
    try {
      console.log("Sending new weight data to the server:", {
        newWeightData,
        recommendations,
      });
      const API_response = await axios.post(
        `${API_URL}`,
        { newWeightData, recommendations }, // Combine data and recommendations into a single object
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Server response for adding new weight data:",
        API_response.data
      );

      toast.success("New weight data added successfully");

      return API_response.data?.data || {};
    } catch (error) {
      console.log(error);
      const errorMessage =
        error.response?.data || "Failed to add new weight data";
      console.error("Error in addNewWeightData:", errorMessage);

      toast.error(errorMessage);

      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to update existing weight data
export const updateExistingWeightData = createAsyncThunk(
  "weight/updateExistingWeightData",
  async ({ id, newWeightData, token }, thunkAPI) => {
    try {
      const response = await axios.put(
        `${API_URL}?id=${id}`,
        { newWeightData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Weight data updated successfully");
      return response.data.updatedWeightDataEntry;
    } catch (error) {
      const errorMessage =
        error.response?.data || "Failed to update weight data";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to delete weight data
export const deleteExistingWeightData = createAsyncThunk(
  "weight/deleteExistingWeightData",
  async ({ id, token }, thunkAPI) => {
    try {
      await axios.delete(`${API_URL}`, {
        params: { id }, // Correct way to pass id as query param
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Weight data deleted successfully");
      return id;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete weight data";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

const weightSlice = createSlice({
  name: "weight",
  initialState: {
    weightData: [], // Updated state name for clarity
    status: "idle",
    loading: false,
    error: null,
  },
  reducers: {
    resetWeightState: (state) => {
      state.weightData = []; // Clear existing weight data
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExistingWeightData.pending, (state) => {
        state.status = "loading";
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExistingWeightData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.weightData = action.payload || []; // Ensure payload is an array
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchExistingWeightData.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = action.payload || "An unknown error occurred"; // Provide a default error message
      })
      .addCase(addNewWeightData.fulfilled, (state, action) => {
        console.log("New Weight Data Added:", action.payload);
        if (!Array.isArray(state.weightData)) {
          state.weightData = [];
        }

        state.weightData = [...state.weightData, action.payload];
        state.status = "succeeded";
        state.loading = false;
        state.error = null;
      })
      .addCase(addNewWeightData.rejected, (state, action) => {
        console.error("Add New Weight Data Rejected:", action.payload);
        state.error = action.payload || "An unknown error occurred"; // Provide a default error message
      })
      .addCase(updateExistingWeightData.fulfilled, (state, action) => {
        if (Array.isArray(state.weightData)) {
          const index = state.weightData.findIndex(
            (entry) => entry._id === action.payload?._id
          );
          if (index !== -1) {
            state.weightData[index] = action.payload || {};
          }
        } else {
          state.weightData = []; // Reset to an empty array if not already
        }
      })
      .addCase(deleteExistingWeightData.pending, (state) => {
        state.status = "loading";
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExistingWeightData.fulfilled, (state, action) => {
        if (Array.isArray(state.weightData)) {
          state.weightData = state.weightData.filter(
            (entry) => entry._id !== action.payload
          );
        } else {
          state.weightData = []; // If it's not an array, reset it to an empty array
        }
        state.status = "succeeded";
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteExistingWeightData.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = action.payload || "Failed to delete weight data";
      });
  },
});

export const { resetWeightState } = weightSlice.actions;

export const selectAllWeightData = (state) => state.weight.weightData; 
export const selectWeightDataLoading = (state) => state.weight.loading;
export const selectWeightDataError = (state) => state.weight.error;

export default weightSlice.reducer;
