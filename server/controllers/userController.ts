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
  getCurrentUserProfileInfo: async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    try {
      const userProfile = await prisma.user.findUnique({
        where: { id },
        include: {
          profileInfo: true, // Gets location, website, github, etc.
          posts: {
            where: { status: "PUBLISHED" },
            orderBy: { createdAt: "desc" },
          },
          reviewsReceived: {
            include: {
              reviewer: {
                select: { username: true, id: true },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!userProfile) {
        return res
          .status(404)
          .json({ message: "User not found in directory." });
      }

      // Flattening the object for the frontend to make it easier to consume
      const responseData = {
        ...userProfile,
        location: userProfile.profileInfo?.location || null,
        website: userProfile.profileInfo?.website || null,
        github: userProfile.profileInfo?.github || null,
        twitter: userProfile.profileInfo?.twitter || null,
      };

      res.status(200).json(responseData);
    } catch (error) {
      console.error("Fetch Profile Error:", error);
      res
        .status(500)
        .json({ message: "Internal server error accessing dossier." });
    }
  },
  updateCurrentUserProfileInfo: async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const {
      profileImageUrl,
      bio,
      specialization,
      location,
      website,
      github,
      twitter,
    } = req.body;

    // Security check: Ensure the authenticated user is only updating their own ID
    if (req.user?.userId !== id) {
      return res.status(403).json({ message: "Unauthorized: Access denied." });
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          profileImageUrl,
          bio,
          specialization,
          profileInfo: {
            // upsert creates the ProfileInfo if it doesn't exist yet
            upsert: {
              create: {
                location,
                website,
                github,
                twitter,
              },
              update: {
                location,
                website,
                github,
                twitter,
              },
            },
          },
        },
        include: {
          profileInfo: true,
        },
      });

      // Format response to match the frontend expectations
      const responseData = {
        ...updatedUser,
        location: updatedUser.profileInfo?.location,
        website: updatedUser.profileInfo?.website,
        github: updatedUser.profileInfo?.github,
        twitter: updatedUser.profileInfo?.twitter,
      };

      res.status(200).json(responseData);
    } catch (error) {
      console.error("Update Profile Error:", error);
      res.status(500).json({ message: "Failed to update user parameters." });
    }
  },
  getProfileReviews: async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    try {
      const reviews = await prisma.review.findMany({
        where: { revieweeId: id },
        include: {
          reviewer: {
            select: {
              id: true,
              username: true,
              profileImageUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.status(200).json(reviews);
    } catch (error) {
      console.error("Fetch Reviews Error:", error);
      res.status(500).json({ message: "Could not retrieve peer assessments." });
    }
  },

  createProfileReview: async (req: AuthRequest, res: Response) => {
    try {
      const { id: revieweeId } = req.params as { id: string };
      const { rating, comment } = req.body as {
        rating: number;
        comment: string;
      };
      const reviewerId = req.user?.userId; // Set by authenticate middleware

      // 1. Basic Validations
      if (!reviewerId) return res.status(401).json({ message: "Unauthorized" });
      if (reviewerId === revieweeId) {
        return res.status(400).json({ message: "You cannot review yourself." });
      }
      if (!rating || rating < 1 || rating > 10) {
        return res
          .status(400)
          .json({ message: "Rating must be between 1 and 10." });
      }

      // 2. Map Rating (1-10) to Reputation Change (-4 to +5)
      // 10=+5, 9=+4, 8=+3, 7=+2, 6=+1, 5=0, 4=-1, 3=-2, 2=-3, 1=-4
      const reputationChange = rating - 5;

      // 3. Database Transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create the Review
        const review = await tx.review.create({
          data: {
            rating,
            comment,
            reviewerId,
            revieweeId,
          },
          include: {
            reviewer: { select: { username: true } },
          },
        });

        // Update the User's reputation_score
        const updatedUser = await tx.user.update({
          where: { id: revieweeId },
          data: {
            reputationScore: {
              increment: reputationChange,
            },
          },
        });

        // Log the change in ReputationLog
        await tx.reputationLog.create({
          data: {
            userId: revieweeId,
            change: reputationChange,
            newTotal: updatedUser.reputationScore,
            reason: `Received a ${rating}/10 review from ${review.reviewer.username}`,
          },
        });

        return review;
      });

      return res.status(201).json({
        message: "Review submitted and reputation updated.",
        review: result,
      });
    } catch (error: any) {
      console.error("Error creating review:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};
