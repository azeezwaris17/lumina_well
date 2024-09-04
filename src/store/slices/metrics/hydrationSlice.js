import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

// API base URL for hydration
const API_URL = "/api/metrics/hydration";

// Async thunk to fetch existing hydration data
export const fetchExistingHydrationData = createAsyncThunk(
  "hydration/fetchExistingHydrationData",
  async (token, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Fetched existing hydration data:", response.data);
      return response.data || []; // Return empty array if data is undefined
    } catch (error) {
      const errorMessage =
        error.response?.data || "Failed to fetch hydration data";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to add new hydration data
export const addNewHydrationData = createAsyncThunk(
  "hydration/addNewHydrationData",
  async ({ newHydrationData, recommendations, token }, thunkAPI) => {
    console.log("This is the token log in the hydration slice:", token);
    try {
      console.log("Sending new hydration data to the server:", {
        newHydrationData,
        recommendations,
      });
      const response = await axios.post(
        `${API_URL}`,
        { newHydrationData, recommendations },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Server response for adding new hydration data:",
        response.data
      );

      toast.success("New hydration data added successfully");
      return response.data?.data || {};
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data || "Failed to add new hydration data";
      console.error("Error in addNewHydrationData:", errorMessage);
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to update existing hydration data
export const updateExistingHydrationData = createAsyncThunk(
  "hydration/updateExistingHydrationData",
  async ({ id, hydrationDataUpdateEntries, token }, thunkAPI) => {
    try {
      const response = await axios.put(
        `${API_URL}?id=${id}`,
        { hydrationDataUpdateEntries },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Hydration data updated successfully");
      return response.data.updatedHydrationDataEntry;
    } catch (error) {
      const errorMessage =
        error.response?.data || "Failed to update hydration data";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to delete hydration data
export const deleteExistingHydrationData = createAsyncThunk(
  "hydration/deleteExistingHydrationData",
  async ({ id, token }, thunkAPI) => {
    try {
      await axios.delete(`${API_URL}`, {
        params: { id }, // Correct way to pass id as query param
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Hydration data deleted successfully");
      return id;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete hydration data";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

const hydrationSlice = createSlice({
  name: "hydration",
  initialState: {
    hydrationData: [], // Updated state name for clarity
    status: "idle",
    loading: false,
    error: null,
  },
  reducers: {
    resetHydrationState: (state) => {
      state.hydrationData = []; // Clear existing hydration data
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExistingHydrationData.pending, (state) => {
        state.status = "loading";
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExistingHydrationData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.hydrationData = action.payload || []; // Ensure payload is an array
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchExistingHydrationData.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = action.payload || "An unknown error occurred"; // Provide a default error message
      })
      .addCase(addNewHydrationData.fulfilled, (state, action) => {
        console.log("New Hydration Data Added:", action.payload);
        if (!Array.isArray(state.hydrationData)) {
          state.hydrationData = [];
        }
        state.hydrationData = [...state.hydrationData, action.payload];
        state.status = "succeeded";
        state.loading = false;
        state.error = null;
      })
      .addCase(addNewHydrationData.rejected, (state, action) => {
        console.error("Add New Hydration Data Rejected:", action.payload);
        state.error = action.payload || "An unknown error occurred"; // Provide a default error message
      })
      .addCase(updateExistingHydrationData.fulfilled, (state, action) => {
        if (Array.isArray(state.hydrationData)) {
          const index = state.hydrationData.findIndex(
            (entry) => entry._id === action.payload?._id
          );
          if (index !== -1) {
            state.hydrationData[index] = action.payload || {}; 
          }
        } else {
          state.hydrationData = []; // Reset to an empty array if not already
        }
      })
      .addCase(deleteExistingHydrationData.pending, (state) => {
        state.status = "loading";
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExistingHydrationData.fulfilled, (state, action) => {
        if (Array.isArray(state.hydrationData)) {
          state.hydrationData = state.hydrationData.filter(
            (entry) => entry._id !== action.payload
          );
        } else {
          state.hydrationData = []; // If it's not an array, reset it to an empty array
        }
        state.status = "succeeded";
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteExistingHydrationData.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = action.payload || "Failed to delete hydration data";
      });
  },
});

export const { resetHydrationState } = hydrationSlice.actions;

export const selectAllHydrationData = (state) => state.hydration.hydrationData; 
export const selectHydrationDataLoading = (state) => state.hydration.loading;
export const selectHydrationDataError = (state) => state.hydration.error;

export default hydrationSlice.reducer;
