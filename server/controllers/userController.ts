import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

export const userController = {
  getCurrentUserProfile: async (req: AuthRequest, res: Response) => {
    try {
      // Assuming you have middleware that attaches 'user' to the request
      // If not, you'll need to decode the token/session here
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          username: true,
          reputationScore: true,
          specialization: true,
          // We only select what the AI Advisor needs
        },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error("AI_ADVISOR_FETCH_ERROR:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
  getProfile: async (req: Request, res: Response) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.params.id as string },
        include: { profileInfo: true, posts: true },
      });
      if (!user) return res.status(404).json({ error: "Profile not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  },

  updateProfile: async (req: Request, res: Response) => {
    try {
      const user = await prisma.user.update({
        where: { id: req.params.id as string },
        data: {
          bio: req.body.bio,
          specialization: req.body.specialization,
          profileInfo: { update: { ...req.body.profileInfo } },
        },
      });
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Profile update failed" });
    }
  },

  getStats: async (req: Request, res: Response) => {
    try {
      const [users, posts] = await Promise.all([
        prisma.user.count(),
        prisma.post.count(),
      ]);
      res.json({ users, posts, kbStored: Math.random() * 100 }); // Mocked kbStored
    } catch (error) {
      res.status(500).json({ error: "Stats failed" });
    }
  },
};
