import { Request, Response } from "express";
// IMPORT the existing instance, DO NOT create a new one here
import prisma from "../lib/prisma"; // Adjust this path to where your Prisma setup file is

export const reputationController = {
  getLogs: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params as { userId: string };

      const logs = await prisma.reputationLog.findMany({
        where: { userId },
        orderBy: { timestamp: "desc" },
        take: 20,
      });

      res.json(logs);
    } catch (error) {
      console.error("Reputation fetch error:", error);
      res.status(500).json({ error: "Failed to fetch reputation data" });
    }
  },
};
