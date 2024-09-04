import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Thunks
export const fetchMetrics = createAsyncThunk(
  "metrics/fetchMetrics",
  async (token, thunkAPI ) => {
    // console.log(token)
    try {
      const { data } = await axios.get("/api/metrics", token);
      // console.log("Metrics fetched:", data);
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
      const { data } = await axios.get(`/api/metrics?metricId=${metricId}`);
      console.log("Metric data fetched:", data);
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
      console.log("Metric added:", data);
      return data.metric;
    } catch (error) {
      console.error("Error adding metric:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateMetric = createAsyncThunk(
  "metrics/updateMetric",
  async (metricData, { rejectWithValue }) => {
    try {
      const { data } = await axios.put("/api/metrics", metricData);
      console.log("Metric updated:", data);
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
      console.log("Metric deleted:", data);
      return metricType;
    } catch (error) {
      console.error("Error deleting metric:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const metricsSlice = createSlice({
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
        state.metrics = action.payload;
       
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

export default metricsSlice.reducer;
