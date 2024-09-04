import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

// API base URL
const API_URL = "/api/metrics/dietaryIntake";

// Async thunk to fetch existing dietary intake data
export const fetchExistingDietaryData = createAsyncThunk(
  "dietaryIntake/fetchExistingDietaryIntakeData",
  async (token, thunkAPI) => {
    try {
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Fetched existing dietary intake data:", response.data);
      return response.data || []; // Return empty array if data is undefined
    } catch (error) {
      const errorMessage =
        error.response?.data || "Failed to fetch dietary intake data";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to add new dietary intake data
export const addNewDietaryData = createAsyncThunk(
  "dietaryIntake/addNewDietaryIntakeData",
  async ({ newDietaryIntakeData, token }, thunkAPI) => {
    try {
      console.log(
        "Sending new dietary intake data to the server:",
        newDietaryIntakeData
      );
      const response = await axios.post(
        API_URL,
        newDietaryIntakeData, // Send the data directly
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Server response for adding new dietary intake data:",
        response.data
      );

      toast.success("New dietary intake data added successfully");
      return response.data?.data || {}; // Return the new data or empty object
    } catch (error) {
      const errorMessage =
        error.response?.data || "Failed to add new dietary intake data";
      console.error("Error in addNewDietaryIntakeData:", errorMessage);
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to update existing dietary intake data
export const updateExistingDietaryData = createAsyncThunk(
  "dietaryIntake/updateExistingDietaryIntakeData",
  async ({ id, newDietaryIntakeData, token }, thunkAPI) => {
    try {
      const response = await axios.put(
        `${API_URL}?id=${id}`,
        newDietaryIntakeData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Dietary intake data updated successfully");
      return response.data.updatedDietaryIntakeEntry;
    } catch (error) {
      const errorMessage =
        error.response?.data || "Failed to update dietary intake data";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to delete dietary intake data
export const deleteExistingDietaryData = createAsyncThunk(
  "dietaryIntake/deleteExistingDietaryIntakeData",
  async ({ id, token }, thunkAPI) => {
    try {
      await axios.delete(API_URL, {
        params: { id }, // Pass id as query param
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Dietary intake data deleted successfully");
      return id;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete dietary intake data";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

const dietaryIntakeSlice = createSlice({
  name: "dietaryIntake",
  initialState: {
    dietaryIntakeData: [], // State for storing dietary intake data
    status: "idle",
    loading: false,
    error: null,
  },
  reducers: {
    resetDietaryIntakeState: (state) => {
      state.dietaryIntakeData = []; // Clear existing dietary intake data
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExistingDietaryData.pending, (state) => {
        state.status = "loading";
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExistingDietaryData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.dietaryIntakeData = action.payload || []; // Ensure payload is an array
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchExistingDietaryData.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = action.payload || "An unknown error occurred"; // Provide a default error message
      })
      .addCase(addNewDietaryData.fulfilled, (state, action) => {
        console.log("New Dietary Intake Data Added:", action.payload);
        if (!Array.isArray(state.dietaryIntakeData)) {
          state.dietaryIntakeData = [];
        }
        state.dietaryIntakeData = [...state.dietaryIntakeData, action.payload];
        state.status = "succeeded";
        state.loading = false;
        state.error = null;
      })
      .addCase(addNewDietaryData.rejected, (state, action) => {
        console.error("Add New Dietary Intake Data Rejected:", action.payload);
        state.error = action.payload || "An unknown error occurred"; // Provide a default error message
      })
      .addCase(updateExistingDietaryData.fulfilled, (state, action) => {
        const index = state.dietaryIntakeData.findIndex(
          (entry) => entry._id === action.payload?._id
        );
        if (index !== -1) {
          state.dietaryIntakeData[index] = action.payload || {}; // Ensure payload is an object
        }
      })
      .addCase(deleteExistingDietaryData.pending, (state) => {
        state.status = "loading";
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExistingDietaryData.fulfilled, (state, action) => {
        if (Array.isArray(state.dietaryIntakeData)) {
          state.dietaryIntakeData = state.dietaryIntakeData.filter(
            (entry) => entry._id !== action.payload
          );
        } else {
          state.dietaryIntakeData = []; // If it's not an array, reset it to an empty array
        }
        state.status = "succeeded";
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteExistingDietaryData.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = action.payload || "Failed to delete dietary intake data";
      });
  },
});

export const { resetDietaryIntakeState } = dietaryIntakeSlice.actions;

export const selectAllDietaryIntakeData = (state) =>
  state.dietaryIntake.dietaryIntakeData;
export const selectDietaryDataLoading = (state) =>
  state.dietaryIntake.loading;
export const selectDietaryDataError = (state) =>
  state.dietaryIntake.error;

export default dietaryIntakeSlice.reducer;
