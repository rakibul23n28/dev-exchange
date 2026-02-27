export interface Post {
  id: string;
  author_id: string;
  author_name: string;
  title: string;
  content: string;
  status: "PUBLISHED" | "DRAFT";
  tags: string[];
  created_at: string;
  updated_at: string;
  views: number;
  reply_count: number;
  likes?: number;
  dislikes?: number;
  image_url?: string;
}

export interface Comment {
  id: string;
  post_id: string;
  parent_id: string | null;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
  upvotes: number;
}

export interface Profile {
  id: string;
  username: string;
  bio: string;
  specialization: string;
  joinDate: string;
  reputation_score: number;
  email: string;
  profile_image_url?: string;
}

export interface Stats {
  users: number;
  posts: number;
  kb_stored: number;
}

export interface ProfileInfo {
  location: string;
  website: string;
  github: string;
  twitter: string;
}
