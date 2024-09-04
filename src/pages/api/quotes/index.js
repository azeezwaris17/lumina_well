import connectDB from "../config/connectDB";
import Quote from "../../../models/quote";

export default async function handler(req, res) {
  const { method } = req;

  await connectDB();

  switch (method) {
    case "GET":
      try {
        const { id, text, author } = req.query;
        const filter = {};

        // Add filters based on query parameters
        if (id) filter._id = id;
        if (text) filter.text = { $regex: text, $options: "i" };
        if (author) filter.author = { $regex: author, $options: "i" };

        // Fetch quotes based on filters
        const quotes = await Quote.find(filter);
        res.status(200).json({ success: true, data: quotes });
      } catch (error) {
        console.error("Error fetching quotes:", error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case "POST":
      try {
        const quote = await Quote.create(req.body);
        res.status(201).json({ success: true, data: quote });
      } catch (error) {
        console.error("Error creating quote:", error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case "PUT":
      try {
        const { id } = req.query;
        const quote = await Quote.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!quote) {
          return res
            .status(404)
            .json({ success: false, message: "Quote not found" });
        }
        res.status(200).json({ success: true, data: quote });
      } catch (error) {
        console.error("Error updating quote:", error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case "DELETE":
      try {
        const { id } = req.query;
        const deletedQuote = await Quote.findByIdAndDelete(id);
        if (!deletedQuote) {
          return res
            .status(404)
            .json({ success: false, message: "Quote not found" });
        }
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        console.error("Error deleting quote:", error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(400).json({ success: false, message: "Method not allowed" });
      break;
  }
}
