import { Router } from "express";
import { postController } from "../controllers/postController";
import { commentController } from "../controllers/commentController";
import { userController } from "../controllers/userController";
import { authController } from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { sessionController } from "../controllers/sessionController";
import { reputationController } from "../controllers/reputationController";
import { systemController } from "../controllers/systemController";

const router = Router();

//systemController
router.get("/system/stats", systemController.getStats);
router.get("/system/contributors", systemController.getTopContributors);

//sessions
router.get("/sessions/:userId", sessionController.getUserSession);

// reputation
router.get("/reputation/:userId", reputationController.getLogs);

//auth
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.post("/auth/logout", authenticate, authController.logout);

// Posts
router.get("/posts", postController.getPosts);
router.get("/posts/user/:id", postController.getPostsByUser);
router.get("/posts/:id", postController.getPost);
router.post("/posts", authenticate, postController.createPost);
router.patch("/posts/:id", authenticate, postController.updatePost);
router.delete("/posts/:id", authenticate, postController.deletePost);
router.post("/posts/:id/vote", authenticate, postController.votePost);
router.patch("/posts/:id/view", authenticate, postController.viewPost);

// post Comments
router.get("/posts/:postId/comments", commentController.getComments);
router.post("/posts/:postId/comments", commentController.createComment);
//comment votes
router.get(
  "/posts/:postId/vote-status",
  authenticate,
  postController.userPostStatus,
);

// User & Stats
router.get("/profile/me", authenticate, userController.getCurrentUserProfile);
router.get("/profile/:id", userController.getProfile);
router.patch("/profile/:id", userController.updateProfile);
router.get("/stats", userController.getStats);

export default router;
