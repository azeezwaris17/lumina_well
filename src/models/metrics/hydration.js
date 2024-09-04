const HydrationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
});

module.exports = mongoose.model("Hydration", HydrationSchema);
