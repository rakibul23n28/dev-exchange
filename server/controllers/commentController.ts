import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const commentController = {
  getComments: async (req: Request, res: Response) => {
    try {
      const comments = await prisma.comment.findMany({
        where: { postId: req.params.postId as string },
        include: { author: true, replies: { include: { author: true } } },
      });
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  },

  createComment: async (req: Request, res: Response) => {
    try {
      const comment = await prisma.comment.create({
        data: {
          content: req.body.content,
          postId: req.params.postId as string,
          authorId: req.body.authorId,
          parentId: req.body.parentId, // For nested replies
        },
      });
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ error: "Comment creation failed" });
    }
  },
};
