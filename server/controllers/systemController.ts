import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const systemController = {
  // Correct order: (req, res)
  getStats: async (req: Request, res: Response) => {
    try {
      // 1. Get basic counts using standard Prisma
      const [userCount, postCount] = await Promise.all([
        prisma.user.count(),
        prisma.post.count(),
      ]);

      // 2. Use Raw SQL to calculate the byte length of text columns
      // We use OCTET_LENGTH to get the actual storage size in bytes
      const storageResult = await prisma.$queryRaw<any[]>`
        SELECT 
          (SELECT COALESCE(SUM(OCTET_LENGTH(content)), 0) FROM "Post") + 
          (SELECT COALESCE(SUM(OCTET_LENGTH(content)), 0) FROM "Comment") 
        as total_bytes
      `;

      // 3. Process the storage size
      // Postgres returns BigInt for sums, so we convert to Number
      const totalBytes = Number(storageResult[0]?.total_bytes || 0);
      const kbStored = parseFloat((totalBytes / 1024).toFixed(2));

      // 4. Update and return the SystemStats record
      const stats = await prisma.systemStats.upsert({
        where: { id: 1 },
        update: {
          users: userCount,
          posts: postCount,
          kbStored: kbStored,
        },
        create: {
          id: 1,
          users: userCount,
          posts: postCount,
          kbStored: kbStored,
        },
      });

      return res.status(200).json(stats);
    } catch (error) {
      console.error("Failed to fetch system stats:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getTopContributors: async (req: Request, res: Response) => {
    try {
      const contributors = await prisma.user.findMany({
        take: 5,
        select: {
          id: true,
          username: true,
          _count: {
            select: { posts: true },
          },
          // Optional: include total likes if you want to keep that logic
        },
        orderBy: {
          posts: { _count: "desc" },
        },
      });

      // Flatten the structure for the frontend
      const formatted = contributors.map((u) => ({
        id: u.id,
        username: u.username,
        postCount: u._count.posts,
      }));

      return res.status(200).json(formatted);
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
