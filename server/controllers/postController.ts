import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { AuthRequest } from "../middleware/auth";

const PostSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(10),
  authorId: z.string().cuid(),
  tags: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional(),
});

export const postController = {
  getPosts: async (req: Request, res: Response) => {
    try {
      const posts = await prisma.post.findMany({
        include: { author: true, _count: { select: { comments: true } } },
        orderBy: { createdAt: "desc" },
      });
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  },

  getPost: async (req: Request, res: Response) => {
    try {
      const post = await prisma.post.findUnique({
        where: { id: req.params.id as string },
        include: { author: true, comments: { include: { author: true } } },
      });
      if (!post) return res.status(404).json({ error: "Post not found" });
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  },

  createPost: async (req: AuthRequest, res: Response) => {
    const { title, content, tags, status } = req.body;

    // Use the key defined in the middleware
    const authorId = req.user?.userId;

    if (!authorId)
      return res.status(401).json({ error: "User not identified" });

    try {
      const post = await prisma.post.create({
        data: {
          title,
          content,
          tags,
          status,
          authorId: authorId, // This links the post to the logged-in user
        },
      });
      res.status(201).json(post);
    } catch (err) {
      res.status(500).json({ error: "Database error while creating post" });
    }
  },

  updatePost: async (req: AuthRequest, res: Response) => {
    const { id }: { id: string } = req.params as { id: string };
    const { title, content, tags, status } = req.body; // Explicitly destructure
    const userId = req.user?.userId;

    try {
      const post = await prisma.post.findUnique({ where: { id } });

      if (!post) return res.status(404).json({ error: "Post not found" });
      if (post.authorId !== userId)
        return res.status(403).json({ error: "Unauthorized" });

      const updatedPost = await prisma.post.update({
        where: { id },
        data: {
          title, // Only update what's allowed
          content,
          tags,
          status: status?.toUpperCase(), // Ensure it matches Prisma ENUM
        },
      });

      res.json(updatedPost);
    } catch (error) {
      res.status(400).json({ error: "Update failed" });
    }
  },

  deletePost: async (req: AuthRequest, res: Response) => {
    const { id }: { id: string } = req.params as { id: string };
    const userId = req.user?.userId;

    try {
      // 1. Find the post to check ownership
      const post = await prisma.post.findUnique({
        where: { id },
      });

      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      // 2. Verify ownership
      if (post.authorId !== userId) {
        return res
          .status(403)
          .json({ error: "Unauthorized: You can only delete your own posts" });
      }

      // 3. Delete
      await prisma.post.delete({
        where: { id },
      });

      res.json({ success: true, message: "Post deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: "Delete failed" });
    }
  },

  likePost: async (req: Request, res: Response) => {
    try {
      const post = await prisma.post.update({
        where: { id: req.params.id as string },
        data: { likes: { increment: 1 } },
      });
      res.json(post);
    } catch (error) {
      res.status(400).json({ error: "Post not found" });
    }
  },

  dislikePost: async (req: Request, res: Response) => {
    try {
      const post = await prisma.post.update({
        where: { id: req.params.id as string },
        data: { dislikes: { increment: 1 } },
      });
      res.json(post);
    } catch (error) {
      res.status(400).json({ error: "Post not found" });
    }
  },
};
