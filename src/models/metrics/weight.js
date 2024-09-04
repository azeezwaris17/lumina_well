const WeightSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  weight: { type: Number, required: true },
});

module.exports = mongoose.model("Weight", WeightSchema);
