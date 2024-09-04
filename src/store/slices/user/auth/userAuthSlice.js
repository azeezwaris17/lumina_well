// src/store/slices/user/auth/userAuthSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { HYDRATE } from "next-redux-wrapper";

// Define async thunks

// register thunk
export const registerUser = createAsyncThunk(
  "user/registerUser",
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post("/api/auth/user/register", userData);
      console.log("Response Data:", response.data); 
      return response.data; 
    } catch (error) {
     const errorMessage = error.response?.data?.message || "Registration failed";
     return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
);


// login thunk
export const loginUser = createAsyncThunk(
  "user/loginUser",
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post("/api/auth/user/login", userData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      return thunkAPI.rejectWithValue({ message: errorMessage });
    }
  }
);


// reset-password thunk
export const resetUserPassword = createAsyncThunk(
  "user/resetUserPassword",
  async (resetData, thunkAPI) => {
    try {
      const response = await axios.post(
        "/api/auth/user/reset-password",
        resetData
      );
      return response.data; // Ensure this returns an object
    } catch (error) {
       const errorMessage = error.response?.data?.message || "Password reset failed";
       return thunkAPI.rejectWithValue({ message: errorMessage });
      
    }
  }
);

const userAuthSlice = createSlice({
  name: "userAuth",
  initialState: {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
       state.isAuthenticated = false;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(HYDRATE, (state, action) => {
        if (action.payload.userAuth) {
          state.user = action.payload.userAuth.user;
        }
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
         state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resetUserPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetUserPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});


// Define the selector to get the user from the state
export const selectUser = (state) => state.userAuth.user;
export const selectIsAuthenticated = (state) => state.userAuth.isAuthenticated;

export const { logout, setUser } = userAuthSlice.actions;

export default userAuthSlice.reducer;
