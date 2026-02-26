import { Router } from "express";
import { postController } from "../controllers/postController";
import { commentController } from "../controllers/commentController";
import { userController } from "../controllers/userController";
import { authController } from "../controllers/authController";
import { authenticate } from "../middleware/auth";

const router = Router();

//auth
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.post("/auth/logout", authController.logout);

// Posts
router.get("/posts", postController.getPosts);
router.get("/posts/:id", postController.getPost);
router.post("/posts", authenticate, postController.createPost);
router.patch("/posts/:id", authenticate, postController.updatePost);
router.delete("/posts/:id", postController.deletePost);
router.post("/posts/:id/like", postController.likePost);
router.post("/posts/:id/dislike", postController.dislikePost);

// Comments
router.get("/posts/:postId/comments", commentController.getComments);
router.post("/posts/:postId/comments", commentController.createComment);

// User & Stats
router.get("/profile/:id", userController.getProfile);
router.patch("/profile/:id", userController.updateProfile);
router.get("/stats", userController.getStats);

export default router;
