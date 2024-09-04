const ActivitySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  activity: { type: String, required: true },
  duration: { type: Number, required: true },
  intensity: { type: String, required: true },
});

module.exports = mongoose.model("Activity", ActivitySchema);
