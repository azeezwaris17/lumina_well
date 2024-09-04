// src/store/slices/admin/auth/adminAuthSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { HYDRATE } from "next-redux-wrapper";

// Define async thunks
export const registerAdmin = createAsyncThunk(
  "admin/registerAdmin",
  async (adminData, thunkAPI) => {
    try {
      const response = await axios.post("/api/admin/auth/register", adminData);
      console.log("Response Data:", response.data);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
);

export const loginAdmin = createAsyncThunk(
  "admin/loginAdmin",
  async (adminData, thunkAPI) => {
    try {
      const response = await axios.post("/api/admin/auth/login", adminData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
);

export const resetAdminPassword = createAsyncThunk(
  "admin/resetAdminPassword",
  async (resetData, thunkAPI) => {
    try {
      const response = await axios.post(
        "/api/admin/auth/reset-password",
        resetData
      );
      return response.data; 
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Password reset failed";
      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
);

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState: {
    admin: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  },
  reducers: {
    logout: (state) => {
      state.admin = null;
      state.isAuthenticated = false;
    },
    setUser: (state, action) => {
      state.admin = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(HYDRATE, (state, action) => {
        if (action.payload.adminAuth) {
          state.admin = action.payload.adminAuth.admin;
        }
      })
      .addCase(registerAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload;
      })
      .addCase(registerAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resetAdminPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetAdminPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetAdminPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Define the selector to get the user from the state
export const selectAdmin = (state) => state.adminAuth.admin;
export const selectIsAuthenticated = (state) => state.adminAuth.isAuthenticated;

export const { logout, setAdmin } = adminAuthSlice.actions;

export default adminAuthSlice.reducer;
