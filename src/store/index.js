import { configureStore } from "@reduxjs/toolkit";
import userAuthReducer from "./slices/user/auth/userAuthSlice";
import adminAuthReducer from "./slices/admin/auth/adminAuthSlice";
import quotesReducer from "./slices/quoteSlice";
import metricReducer from "./slices/metrics";
import stepReducer from "./slices/metrics/stepsSlice";
import moodReducer from "./slices/metrics/moodSlice";
import weightReducer from "./slices/metrics/weightSlice";
import hydrationReducer from "./slices/metrics/hydrationSlice";
import sleepReducer from "./slices/metrics/sleepSlice";
import dietaryIntakeReducer from "./slices/metrics/dietaryIntakeSlice";

const store = configureStore({
  reducer: {
    userAuth: userAuthReducer,
    adminAuth: adminAuthReducer,
    quotes: quotesReducer,
    metrics: metricReducer,
    sleep: sleepReducer,
    hydration: hydrationReducer,
    weight: weightReducer,
    steps: stepReducer,
    mood: moodReducer,
    dietaryIntake: dietaryIntakeReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
    }),
});

export default store;
