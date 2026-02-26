import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { AuthRequest } from "../middleware/auth";
export enum VoteType {
  LIKE = "LIKE",
  DISLIKE = "DISLIKE",
}

const PostSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(10),
  authorId: z.string().cuid(),
  tags: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional(),
});

export const postController = {
  getPosts: async (req: Request, res: Response) => {
    const {
      search,
      page = "1",
      limit = "10",
    } = req.query as {
      search?: string;
      page?: string;
      limit?: string;
    };

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    try {
      const where: any = {
        status: "PUBLISHED" as const,
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
            { tags: { has: search } }, // Matches exact tag
            { author: { username: { contains: search, mode: "insensitive" } } },
          ],
        }),
      };

      // Run queries in parallel
      const [postsData, totalCount] = await Promise.all([
        prisma.post.findMany({
          where,
          include: {
            author: {
              select: {
                id: true,
                username: true,
                profileImageUrl: true,
              },
            },
            _count: {
              select: {
                comments: true,
                votes: true, // Total votes
              },
            },
            // Fetch specific counts for Score calculation
            votes: {
              select: {
                type: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take,
        }),
        prisma.post.count({ where }),
      ]);

      // Calculate score manually for each post
      const posts = postsData.map((post) => {
        const likes = post.votes.filter((v) => v.type === "LIKE").length;
        const dislikes = post.votes.filter((v) => v.type === "DISLIKE").length;

        // Remove the full votes array from response to keep payload small
        const { votes, ...postWithoutVotes } = post;

        return {
          ...postWithoutVotes,
          likesCount: likes,
          dislikesCount: dislikes,
          score: likes - dislikes,
          reply_count: post._count.comments,
        };
      });

      res.status(200).json({
        posts,
        meta: {
          totalCount,
          totalPages: Math.ceil(totalCount / take),
          currentPage: Number(page),
        },
      });
    } catch (error) {
      console.error("Fetch Posts Error:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  },

  getPost: async (req: Request, res: Response) => {
    try {
      const post = await prisma.post.findUnique({
        where: { id: req.params.id as string },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              profileImageUrl: true,
              reputationScore: true,
            },
          },
          // Include counts for the nested votes filtered by type
          _count: {
            select: {
              votes: true, // Total votes
              comments: true, // Total comments
            },
          },
          // We fetch the comments and their authors
          comments: {
            include: { author: true },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      // Since Prisma's _count doesn't support filtering by Enum in a single findUnique call yet,
      // we fetch the filtered counts for LIKE and DISLIKE separately or via a manual count.
      const [likesCount, dislikesCount] = await Promise.all([
        prisma.postVote.count({
          where: { postId: post.id, type: "LIKE" },
        }),
        prisma.postVote.count({
          where: { postId: post.id, type: "DISLIKE" },
        }),
      ]);

      // Construct the final object to match what your frontend expects
      const responseData = {
        ...post,
        likesCount,
        dislikesCount,
        reply_count: post._count.comments, // Mapping for your frontend key
      };

      res.json(responseData);
    } catch (error) {
      console.error("GetPost Error:", error);
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
    const { id } = req.params as { id: string };
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1️⃣ Find post
        const post = await tx.post.findUnique({
          where: { id },
          select: {
            id: true,
            authorId: true,
          },
        });

        if (!post) {
          throw new Error("NOT_FOUND");
        }

        // 2️⃣ Ownership check
        if (post.authorId !== userId) {
          throw new Error("FORBIDDEN");
        }

        // 3️⃣ Delete post (comments + votes cascade automatically)
        await tx.post.delete({
          where: { id },
        });

        // 4️⃣ Update system stats
        await tx.systemStats.update({
          where: { id: 1 },
          data: {
            posts: { decrement: 1 },
          },
        });

        return true;
      });

      if (result) {
        return res.json({
          success: true,
          message: "Post deleted successfully",
        });
      }
    } catch (error: any) {
      if (error.message === "NOT_FOUND") {
        return res.status(404).json({ error: "Post not found" });
      }

      if (error.message === "FORBIDDEN") {
        return res
          .status(403)
          .json({ error: "Unauthorized: You can only delete your own posts" });
      }

      console.error(error);
      return res.status(500).json({ error: "Delete failed" });
    }
  },

  votePost: async (req: AuthRequest, res: Response) => {
    const { id: postId } = req.params as { id: string };
    const { type } = req.body as { type: "like" | "dislike" }; // Cast to expected strings
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // 1. Properly map the incoming string to the Prisma Enum
    const targetVoteType =
      type.toUpperCase() === "LIKE" ? VoteType.LIKE : VoteType.DISLIKE;

    try {
      const result = await prisma.$transaction(async (tx) => {
        // 2. Check if a vote already exists
        const existingVote = await tx.postVote.findUnique({
          where: {
            userId_postId: { userId, postId },
          },
        });

        if (existingVote) {
          if (existingVote.type === targetVoteType) {
            // Case A: User clicked the SAME button -> Remove the vote
            await tx.postVote.delete({
              where: { id: existingVote.id },
            });
          } else {
            // Case B: User clicked the OPPOSITE button -> Update to what they just clicked
            // FIX: Previously you were toggling based on a ternary,
            // now we just set it to the targetVoteType.
            await tx.postVote.update({
              where: { id: existingVote.id },
              data: { type: targetVoteType },
            });
          }
        } else {
          // Case C: No existing vote -> Create new one
          await tx.postVote.create({
            data: {
              userId,
              postId,
              type: targetVoteType,
            },
          });
        }

        // 3. Fetch the updated post
        const updatedPost = await tx.post.findUnique({
          where: { id: postId },
          include: {
            author: { select: { username: true } }, // Optional: include author if needed for frontend
          },
        });

        // 4. Get fresh counts
        const likesCount = await tx.postVote.count({
          where: { postId, type: VoteType.LIKE },
        });
        const dislikesCount = await tx.postVote.count({
          where: { postId, type: VoteType.DISLIKE },
        });

        // 5. Determine the final state of the user's vote
        const newUserVote = await tx.postVote.findUnique({
          where: { userId_postId: { userId, postId } },
        });

        return {
          post: {
            ...updatedPost,
            likesCount,
            dislikesCount,
          },
          userVote: newUserVote?.type.toLowerCase() || null,
        };
      });

      return res.status(200).json(result);
    } catch (error) {
      console.error("Vote Error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getPostsByUser: async (req: Request, res: Response) => {
    try {
      const posts = await prisma.post.findMany({
        where: { authorId: req.params.id as string },
        orderBy: { createdAt: "desc" },
      });
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  },

  userPostStatus: async (req: AuthRequest, res: Response) => {
    const { postId } = req.params as { postId: string };
    const userId = req.user?.userId;

    // If there's no userId, the user is guest; they haven't voted.
    if (!userId) {
      return res.status(200).json({ vote: null });
    }

    try {
      // Look for a unique record for this specific user and post
      const existingVote = await prisma.postVote.findUnique({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
        select: {
          type: true, // We only need the type (LIKE or DISLIKE)
        },
      });

      // Return the type in lowercase to match your frontend state: "like" | "dislike" | null
      return res.status(200).json({
        vote: existingVote ? existingVote.type.toLowerCase() : null,
      });
    } catch (error) {
      console.error("Error fetching vote status:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
  viewPost: async (req: Request, res: Response) => {
    await prisma.post.update({
      where: { id: req.params.id } as { id: string },
      data: { views: { increment: 1 } },
    });
    res.sendStatus(204);
  },
};
