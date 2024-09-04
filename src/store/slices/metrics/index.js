// store/slices/metrics/index.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Thunks
export const fetchMetrics = createAsyncThunk(
  "metrics/fetchMetrics",
  async (token, thunkAPI) => {
    try {
      const { data } = await axios.get("/api/metrics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data.metrics;
    } catch (error) {
      console.error("Error fetching metrics:", error);
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMetricData = createAsyncThunk(
  "metrics/fetchMetricData",
  async (metricId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/metrics/${metricId}`);
      return data;
    } catch (error) {
      console.error("Error fetching metric data:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const enrolMetric = createAsyncThunk(
  "metrics/enrolMetric",
  async (metricData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/api/metrics", metricData);
      return data.metric;
    } catch (error) {
      console.error("Error enrolling in metric:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateMetric = createAsyncThunk(
  "metrics/updateMetric",
  async (metricData, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `/api/metrics/${metricData._id}`,
        metricData
      );
      return data.metric;
    } catch (error) {
      console.error("Error updating metric:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteMetric = createAsyncThunk(
  "metrics/deleteMetric",
  async (metricType, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete("/api/metrics", {
        data: { metricType },
      });
      return metricType;
    } catch (error) {
      console.error("Error deleting metric:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const metricSlice = createSlice({
  name: "metrics",
  initialState: {
    metrics: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMetrics.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMetrics.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.metrics = action.payload;
      })
      .addCase(fetchMetrics.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchMetricData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMetricData.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.metrics.findIndex(
          (metric) => metric._id === action.payload._id
        );
        if (index !== -1) {
          state.metrics[index] = action.payload;
        } else {
          state.metrics.push(action.payload);
        }
      })
      .addCase(fetchMetricData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(enrolMetric.pending, (state) => {
        state.status = "loading";
      })
      .addCase(enrolMetric.fulfilled, (state, action) => {
        state.metrics.push(action.payload);
        state.status = "succeeded";
      })
      .addCase(enrolMetric.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateMetric.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateMetric.fulfilled, (state, action) => {
        const index = state.metrics.findIndex(
          (metric) => metric._id === action.payload._id
        );
        if (index !== -1) {
          state.metrics[index] = action.payload;
        }
        state.status = "succeeded";
      })
      .addCase(updateMetric.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(deleteMetric.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteMetric.fulfilled, (state, action) => {
        state.metrics = state.metrics.filter(
          (metric) => metric.metricType !== action.payload
        );
        state.status = "succeeded";
      })
      .addCase(deleteMetric.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const selectAllMetrics = (state) => state.metrics.metrics;
export const selectMetricById = (state, metricId) =>
  state.metrics.metrics.find((metric) => metric._id === metricId);
export const selectMetricsStatus = (state) => state.metrics.status;
export const selectMetricsError = (state) => state.metrics.error;

export default metricSlice.reducer;
