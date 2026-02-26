import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";

// Validation Schemas
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(3),
  bio: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const authController = {
  // --- REGISTER ---
  register: async (req: Request, res: Response) => {
    try {
      const { email, password, username, bio } = RegisterSchema.parse(req.body);

      // 1. Check if user exists
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
      });

      if (existingUser) {
        return res
          .status(400)
          .json({ error: "Email or username already taken" });
      }

      // 2. Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 3. Create user and profile
      const user = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword, // Make sure you added 'password' to your Prisma schema!
          bio,
          profileInfo: { create: {} }, // Initialize empty profile
        },
      });

      res
        .status(201)
        .json({ message: "User created successfully", success: true });
    } catch (error) {
      if (error instanceof z.ZodError)
        return res.status(400).json({ errors: error.flatten().fieldErrors });
      res.status(500).json({ error: "Registration failed" });
    }
  },

  // --- LOGIN ---
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = LoginSchema.parse(req.body);

      // 1. Find user
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(404).json({ error: "User not found" });

      // 2. Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid)
        return res.status(401).json({ error: "Invalid password" });

      // 3. Generate JWT
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      // 4. Send token in HttpOnly Cookie (Secure)
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          created_at: user.joinDate,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError)
        return res.status(400).json({ errors: error.flatten().fieldErrors });
      res.status(500).json({ error: "Server error" });
    }
  },

  // --- LOGOUT ---
  logout: async (_req: Request, res: Response) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
  },
};
