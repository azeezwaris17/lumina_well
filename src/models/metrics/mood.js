const MoodSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  mood: { type: String, required: true },
  notes: { type: String },
});

module.exports = mongoose.model("Mood", MoodSchema);
