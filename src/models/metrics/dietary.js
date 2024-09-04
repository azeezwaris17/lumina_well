const DietarySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  food: { type: String, required: true },
  calories: { type: Number, required: true },
  nutrients: { type: Map, of: Number },
});

module.exports = mongoose.model("Dietary", DietarySchema);
