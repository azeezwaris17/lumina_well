// src/pages/api/auth/user/login.js
import User from "../../../../models/user";
import connectDB from "../../config/connectDB";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "POST") {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      console.log("user email found:", email);

      if (!user) {
        return res.status(400).json({ message: "Email not found" });
      }

      const isPasswordValid = await user.comparePassword(password);

      if (isPasswordValid) {
        const token = generateToken(user._id);

        res.json({
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          token,
          message: "Login successful",
        });
      } else {
        return res.status(401).json({ message: "Invalid email or password" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
