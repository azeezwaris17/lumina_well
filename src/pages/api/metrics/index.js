import connectDB from "../config/connectDB";
import Metric from "@/models/Metric";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await connectDB();

  // Extract token from request headers
  const token = req.headers.authorization?.split(" ")[1];
  console.log("This is the token log in the api:", token);

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  let session;
  try {
    // Verify the token
    session = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }

  switch (req.method) {
    case "GET":
      // If the request includes a metricId, fetch specific metric data
      if (req.query.metricId) {
        return fetchMetricData(req, res, session);
      }
      // Otherwise, fetch all metrics
      return fetchMetrics(req, res, session);

    case "POST":
      return enrolMetric(req, res, session);

    case "PUT":
      return updateMetric(req, res, session);

    case "DELETE":
      return deleteMetric(req, res, session);

    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}

// Fetch all metrics
async function fetchMetrics(req, res, session) {
  try {
    const metrics = await Metric.find({ userId: session.id });
    console.log("Metrics retrieved successfully");
    res.status(200).json({ metrics });
  } catch (error) {
    console.error("Error retrieving metrics:", error);
    res.status(500).json({ message: "Server error", error });
  }
}

// Fetch specific metric data
async function fetchMetricData(req, res, session) {
  try {
    const metric = await Metric.findOne({
      _id: req.query.metricId,
      userId: session.id,
    });
    if (!metric) {
      return res.status(404).json({ message: "Metric not found" });
    }
    console.log("Metric data retrieved successfully", metric);
    res.status(200).json(metric);
  } catch (error) {
    console.error("Error retrieving metric data:", error);
    res.status(500).json({ message: "Server error", error });
  }
}

// Enroll a new metric
async function enrolMetric(req, res, session) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { metricType, value, date } = req.body;

  try {
    const metric = new Metric({
      userId: session.id,
      metricType,
      value,
      date: date || new Date(),
    });

    await metric.save();
    console.log("Metric added successfully", metric);
    res.status(201).json({ message: "Metric added successfully", metric });
  } catch (error) {
    console.error("Error adding metric:", error);
    res.status(500).json({ message: "Server error", error });
  }
}

// Update a metric
async function updateMetric(req, res, session) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { metricId, value } = req.body;

  try {
    const metric = await Metric.findOneAndUpdate(
      { _id: metricId, userId: session.id },
      { value },
      { new: true }
    );

    if (!metric) {
      return res.status(404).json({ message: "Metric not found" });
    }

    console.log("Metric updated successfully", metric);
    res.status(200).json({ message: "Metric updated successfully", metric });
  } catch (error) {
    console.error("Error updating metric:", error);
    res.status(500).json({ message: "Server error", error });
  }
}

// Delete a metric
async function deleteMetric(req, res, session) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { metricType } = req.body;

  try {
    const result = await Metric.deleteMany({
      userId: session.id,
      metricType,
    });

    console.log("Metric deleted successfully");
    res.status(200).json({
      message: "Metric deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting metric:", error);
    res.status(500).json({ message: "Server error", error });
  }
}
