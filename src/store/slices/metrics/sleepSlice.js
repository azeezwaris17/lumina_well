// redux/slices/sleepSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

// API base URL
const API_URL = "/api/metrics/sleep";

// Async thunk to fetch existing sleep data
export const fetchExistingSleepData = createAsyncThunk(
  "sleep/fetchExistingSleepData",
  async (token, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Fetched existing sleep data:", response.data);
      return response.data || []; // Return empty array if data is undefined
    } catch (error) {
      const errorMessage = error.response?.data || "Failed to fetch sleep data";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to add new sleep data
export const addNewSleepData = createAsyncThunk(
  "sleep/addNewSleepData",
  async ({ newSleepData, recommendations, token }, thunkAPI) => {
    console.log("This is the token log in the sleep slice:", token)
    try {
      console.log("Sending new sleep data to the server:", {
        newSleepData,
        recommendations,
      });
      const API_response = await axios.post(
        `${API_URL}`,
        { newSleepData, recommendations }, // Combine data and recommendations into a single object
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      console.log("Server response for adding new sleep data:", API_response.data);


      toast.success("New sleep data added successfully");

      return API_response.data?.data || {}; 


    } catch (error) {

      console.log(error)
      const errorMessage =
        error.API_response?.data || "Failed to add new sleep data";
      console.error("Error in addNewSleepData:", errorMessage);

      toast.error(errorMessage);

      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to update existing sleep data
export const updateExistingSleepData = createAsyncThunk(
  "sleep/updateExistingSleepData",
  async ({ id, newSleepData, token }, thunkAPI) => {
    try {
      const response = await axios.put(
        `${API_URL}?id=${id}`,
        { newSleepData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Sleep data updated successfully");
      return response.data.updatedSleepDataEntry;
    } catch (error) {
      const errorMessage =
        error.response?.data || "Failed to update sleep data";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to delete sleep data
export const deleteExistingSleepData = createAsyncThunk(
  "sleep/deleteExistingSleepData",
  async ({ id, token }, thunkAPI) => {
    try {
      await axios.delete(`${API_URL}`, {
        params: { id }, // Correct way to pass id as query param
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Sleep data deleted successfully");
      return id;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete sleep data";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

const sleepSlice = createSlice({
  name: "sleep",
  initialState: {
    sleepData: [], // Updated state name for clarity
    status: "idle",
    loading: false,
    error: null,
  },
  reducers: {
    resetSleepState: (state) => {
      state.sleepData = []; // Clear existing sleep data
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExistingSleepData.pending, (state) => {
        state.status = "loading";
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExistingSleepData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.sleepData = action.payload || []; // Ensure payload is an array
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchExistingSleepData.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = action.payload || "An unknown error occurred"; // Provide a default error message
      })
      .addCase(addNewSleepData.fulfilled, (state, action) => {
        console.log("New Sleep Data Added:", action.payload);
        if (!Array.isArray(state.sleepData)) {
          state.sleepData = [];
        }

        state.sleepData = [...state.sleepData, action.payload];
        state.status = "succeeded";
        state.loading = false;
        state.error = null;
      })
      .addCase(addNewSleepData.rejected, (state, action) => {
        console.error("Add New Sleep Data Rejected:", action.payload);
        state.error = action.payload || "An unknown error occurred"; // Provide a default error message
      })

      .addCase(updateExistingSleepData.fulfilled, (state, action) => {
        if (Array.isArray(state.sleepData)) {
          const index = state.sleepData.findIndex(
            (entry) => entry._id === action.payload?._id
          );
          if (index !== -1) {
            state.sleepData[index] = action.payload || {}; // Ensure payload is an object
          }
        } else {
          state.sleepData = []; // Reset to an empty array if not already
        }
      })

      // Delete Existing Sleep Data
      .addCase(deleteExistingSleepData.pending, (state) => {
        state.status = "loading";
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExistingSleepData.fulfilled, (state, action) => {
        if (Array.isArray(state.sleepData)) {
          state.sleepData = state.sleepData.filter(
            (entry) => entry._id !== action.payload
          );
        } else {
          state.sleepData = []; // If it's not an array, reset it to an empty array
        }
        state.status = "succeeded";
        state.loading = false;
        state.error = null;
      })

      .addCase(deleteExistingSleepData.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = action.payload || "Failed to delete sleep data";
      });
  },
});

export const { resetSleepState } = sleepSlice.actions;

export const selectAllSleepData = (state) => state.sleep.sleepData; // Updated selector name
export const selectSleepDataLoading = (state) => state.sleep.loading;
export const selectSleepDataError = (state) => state.sleep.error;

export default sleepSlice.reducer;
