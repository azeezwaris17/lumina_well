// src/pages/api/auth/user/register
import User from "../../../../models/user";
import connectDB from "../../config/connectDB";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "POST") {
    const { fullName, email, password, role } = req.body;

    try {
      const userExists = await User.findOne({ email });

      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await User.create({
        fullName,
        email,
        password,
        role,
      });

      const token = generateToken(user._id);

      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token,
        message: "User Registration successful",
      });

      console.log("Registration successful");
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
