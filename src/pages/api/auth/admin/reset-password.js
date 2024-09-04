// src/pages/api/admin/auth/reset-password.js
import Admin from "../../../../models/admin";
import connectDB from "../../config/connectDB";
import bcrypt from "bcrypt";


export default async function handler(req, res) {
     await connectDB();
  if (req.method === "POST") {
    const { email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    try {
      const admin = await Admin.findOne({ email });

      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      admin.password = await bcrypt.hash(password, 10);
      await admin.save();


      res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
