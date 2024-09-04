import connectDB from "../../config/connectDB";
import Metric from "../../../../models/Metric";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await connectDB();

  const { method, body, headers, query } = req;

  console.log("This is the request body log in the api:", body)

  // Extract token from request headers
  const token = headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  let session;
  try {
    session = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }

  switch (method) {
    case "GET":
      try {
        const existingSleepData = await Metric.find({
          userId: session.id,
          metricType: "sleep",
        });
        // console.log("sleep data log in the api:", existingSleepData);
        res.status(200).json({
          message: "Existing sleep data fetch successfuly",
          existingSleepData,
        });
      } catch (error) {
        res.status(400).json({ message: "Failed to fetch sleep data", error });
      }
      break;

    case "POST":
      try {
        const { newSleepData, recommendations } = body;

        const {
          date,
          time,
          hoursSlept,
          sleepQuality,
          bedtime,
          wakeTime,
          timeToFallAsleep,
          awakenings,
          tookNap,
          sleepInterruptions,
          sleepConsistency,
          preSleepActivities,
          stressLevels,
          dietaryIntake,
          physicalActivity,
          note,
        } = newSleepData;

        // Ensure only valid metricType fields are included
        const newMetricEntry = new Metric({
          userId: session.id,
          metricType: "sleep",
          sleep: {
            date,
            time,
            hoursSlept,
            sleepQuality,
            note,
            bedtime,
            wakeTime,
            timeToFallAsleep,
            awakenings,
            tookNap,
            sleepInterruptions,
            sleepConsistency,
            preSleepActivities,
            stressLevels,
            dietaryIntake,
            physicalActivity,
          },
          recommendations,
        });

        await newMetricEntry.save();

        console.log("new sleep data entries log in the api:", newMetricEntry);

        res.status(201).json({
          message: "New Sleep data entries saved successfuly",
          newMetricEntry,
        });
      } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Failed to add sleep entry", error });
      }
      break;

    case "PUT":
      try {
        const { newSleepData } = body;
        const updatedSleepDataEntry = await Metric.findByIdAndUpdate(
          id,
          { sleep: newSleepData },
          { new: true }
        );

        if (!updatedSleepDataEntry) {
          return res.status(404).json({ message: "Sleep entry not found" });
        }

        res.status(200).json({
          message: "Sleep data updated successfully",
          updatedSleepDataEntry,
        });
      } catch (error) {
        res
          .status(400)
          .json({ message: "Failed to update sleep entry", error });
      }
      break;

    case "DELETE":
      try {
        const { id } = req.query; // Ensure you're extracting the id correctly
        const deletedSleepDataEntry = await Metric.findByIdAndDelete(id);

        if (!deletedSleepDataEntry) {
          return res.status(404).json({ message: "Sleep entry not found" });
        }

        res.status(200).json({ message: "Sleep entry deleted successfully" });
      } catch (error) {
        res
          .status(400)
          .json({ message: "Failed to delete sleep entry", error });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
