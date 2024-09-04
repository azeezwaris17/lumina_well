// models/Quote.js
import mongoose from 'mongoose';

const quoteSchema = new mongoose.Schema({
  text: String,

  author: String,
  
  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Quote || mongoose.model("Quote", quoteSchema);