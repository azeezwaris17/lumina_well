const SleepSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  hours: { type: Number, required: true },
});

module.exports = mongoose.model("Sleep", SleepSchema);
