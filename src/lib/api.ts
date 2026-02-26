import * as storage from "./localStorage";
import { Post, Comment, Profile, Stats } from "../../share-types/types";

export const api = {
  getPosts: async (): Promise<Post[]> => {
    return storage.getPosts();
  },

  getPost: async (id: string): Promise<Post> => {
    const post = storage.getPost(id);
    if (!post) throw new Error("Post not found");
    return post;
  },

  createPost: async (data: Partial<Post>): Promise<Post> => {
    return storage.createPost(data);
  },

  updatePost: async (id: string, data: Partial<Post>): Promise<Post> => {
    return storage.updatePost(id, data);
  },

  deletePost: async (id: string): Promise<boolean> => {
    return storage.deletePost(id);
  },

  likePost: async (id: string): Promise<any> => {
    return storage.likePost(id);
  },

  dislikePost: async (id: string): Promise<any> => {
    return storage.dislikePost(id);
  },

  getUserVote: (id: string): string | null => {
    return storage.getUserVote(id);
  },

  getComments: async (postId: string): Promise<Comment[]> => {
    return storage.getComments(postId);
  },

  createComment: async (
    postId: string,
    data: Partial<Comment>,
  ): Promise<Comment> => {
    return storage.createComment(postId, data);
  },

  getProfile: async (id: string): Promise<Profile> => {
    const profile = storage.getProfile(id);
    if (!profile) throw new Error("Profile not found");
    return profile;
  },

  updateProfile: async (
    id: string,
    data: Partial<Profile>,
  ): Promise<Profile> => {
    return storage.updateProfile(id, data);
  },

  getStats: async (): Promise<Stats> => {
    return storage.getStats();
  },
};
