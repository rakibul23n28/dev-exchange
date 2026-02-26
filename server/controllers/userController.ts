import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const userController = {
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
