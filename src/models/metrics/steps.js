const StepsSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  steps: { type: Number, required: true },
});

module.exports = mongoose.model("Steps", StepsSchema);
