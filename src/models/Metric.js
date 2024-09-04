import mongoose from "mongoose";

const metricSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    metricType: {
      type: String,
      required: true,
      enum: [
        "steps",
        "sleep",
        "hydration",
        "weight",
        "mood",
        "activity",
        "dietaryIntake",
      ],
    },

    // steps
    steps: {
      date: {
        type: Date,
      },
      stepsCount: {
        type: Number,
      },
      distance: {
        type: Number,
      },
      caloriesBurned: {
        type: Number,
      },
      timeOfDay: {
        type: String,
      },
      notes: {
        type: String,
      },
    },

    // sleep
    sleep: {
      dateRange: {
        start: Date,
        end: Date,
      },
      totalHoursInInterval: Number,

      date: {
        type: Date,
        default: Date.now,
      },
      time: {
        type: String,
        default: new Date().toLocaleTimeString(),
      },
      hoursSlept: {
        type: Number,
      },
      sleepQuality: {
        type: String,
        enum: ["Poor", "Good", "Excellent"],
      },

      bedtime: {
        type: String,
      },
      wakeTime: {
        type: String,
      },
      timeToFallAsleep: {
        type: Number,
      },
      awakenings: {
        type: Number,
      },
      tookNap: {
        type: Boolean,
      },
      sleepInterruptions: {
        type: String,
      },
      sleepConsistency: {
        type: String,
        enum: ["consistent", "inconsistent"],
      },
      preSleepActivities: {
        type: String,
      },
      stressLevels: {
        type: String,
        enum: ["low", "moderate", "high"],
      },
      dietaryIntake: {
        type: String,
      },
      physicalActivity: {
        type: String,
        enum: ["none", "light", "moderate", "intense"],
      },
      note: {
        type: String,
      },

      recommendations: {
        type: String,
      },
    },

    // hydration
    hydration: {
      date: { type: Date },
      dailyWaterIntake: { type: Number },
      hydrationGoal: { type: Number },
      notes: { type: String, default: "" },
      recommendations: { type: [String], default: [] },
    },

    weight: {
      date: { type: Date },
      weight: { type: Number },
      bodyFatPercentage: { type: Number },
      note: { type: String },
    },

    // mood
    mood: {
      // Fields for mood metric
      date: { type: Date },
      moodStatus: {
        type: String,
        enum: ["Anxious", "Sad", "Neutral", "Happy", "Angry"],
      },

      description: { type: String },
      notes: { type: String, default: "" },
    },

    // activity
    activity: {
      activityType: String,
      duration: Number,
      caloriesBurned: Number,
    },

    // diet
    dietaryIntake: {
      date: { type: Date },
      foodItem: { type: String },
      quantity: { type: Number },
      calories: { type: Number },
      mealType: {
        type: String,
        enum: ["Breakfast", "Lunch", "Dinner", "Snack"],
      },
      foodClass: {
        type: String,
        enum: ["Carbohydrate", "Protein", "Fat", "Carbohydrate and Protein", "All"],
      },
      notes: { type: String, default: "" },
      recommendations: { type: [String], default: [] },
    },
  },
  { timestamps: true }
);

const Metric = mongoose.models.Metric || mongoose.model("Metric", metricSchema);
export default Metric;
