import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import useragent from "useragent";

export const sessionController = {
  getUserSession: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params as { userId: string };
      const sessions = await prisma.session.findMany({
        where: { userId },
        orderBy: { timestamp: "desc" },
        take: 5, // Dashboard only shows last 5
      });
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  },
  createSession: async (userId: string, req: Request, uaOverride?: string) => {
    // 1. Resolve User Agent
    const uaString = uaOverride || req.headers["user-agent"] || "";
    const agent = useragent.parse(uaString);

    // 2. Resolve and Clean IP Address
    let ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket.remoteAddress ||
      "unknown";

    // Clean IPv4-mapped IPv6 addresses (e.g., ::ffff:127.0.0.1 -> 127.0.0.1)
    if (ip.includes("::ffff:")) {
      ip = ip.replace("::ffff:", "");
    }
    // Clean IPv6 Loopback (e.g., ::1 -> 127.0.0.1)
    if (ip === "::1") {
      ip = "127.0.0.1";
    }

    // 3. Database Transaction: Create new and prune old
    return await prisma.$transaction(async (tx) => {
      // Create the new record
      const newSession = await tx.session.create({
        data: {
          userId: userId,
          ipAddress: ip,
          os: agent.os.toString(),
          browser: agent.toAgent(),
        },
      });

      // Fetch all session IDs for this user to check count
      const userSessions = await tx.session.findMany({
        where: { userId },
        select: { id: true },
        orderBy: { timestamp: "desc" },
      });

      // If more than 5 exist, delete the oldest ones
      if (userSessions.length > 5) {
        const idsToDelete = userSessions.slice(5).map((s) => s.id);
        await tx.session.deleteMany({
          where: { id: { in: idsToDelete } },
        });
      }

      return newSession;
    });
  },
};
