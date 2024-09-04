import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk to fetch quotes with optional filters
export const fetchQuotes = createAsyncThunk(
  "quotes/fetchQuotes",
  async (filters = {}) => {
    const { id, text, author } = filters;
    const response = await axios.get("/api/quotes", {
      params: { id, text, author },
    });
    console.log("Fetched quotes:", response.data.data); // Debugging
    return response.data.data;
  }
);

// Async thunk to add a new quote
export const addQuote = createAsyncThunk(
  "quotes/addQuote",
  async (quoteData) => {
    const response = await axios.post("/api/quotes", quoteData);
    console.log("Added quote:", response.data.data); // Debugging
    return response.data.data;
  }
);

// Async thunk to update an existing quote
export const updateQuote = createAsyncThunk(
  "quotes/updateQuote",
  async ({ id, quoteData }) => {
    const response = await axios.put(`/api/quotes?id=${id}`, quoteData);
    console.log("Updated quote:", response.data.data); // Debugging
    return response.data.data;
  }
);

// Async thunk to delete a quote by ID
export const deleteQuote = createAsyncThunk(
  "quotes/deleteQuote",
  async (id) => {
    await axios.delete(`/api/quotes?id=${id}`);
    console.log("Deleted quote ID:", id); // Debugging
    return id;
  }
);

const quoteSlice = createSlice({
  name: "quotes",
  initialState: {
    quotes: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuotes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchQuotes.fulfilled, (state, action) => {
        state.quotes = action.payload;
        state.loading = false;
      })
      .addCase(fetchQuotes.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(addQuote.fulfilled, (state, action) => {
        state.quotes.push(action.payload);
      })
      .addCase(updateQuote.fulfilled, (state, action) => {
        const index = state.quotes.findIndex(
          (quote) => quote._id === action.payload._id
        );
        if (index !== -1) state.quotes[index] = action.payload;
      })
      .addCase(deleteQuote.fulfilled, (state, action) => {
        state.quotes = state.quotes.filter(
          (quote) => quote._id !== action.payload
        );
      });
  },
});

export default quoteSlice.reducer;

// Selector to get all quotes from the store
export const selectAllQuotes = (state) => state.quotes?.quotes;
