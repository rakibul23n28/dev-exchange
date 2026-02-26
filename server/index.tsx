import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

console.log("Initializing server with:", {
  supabaseUrl: supabaseUrl ? "SET" : "MISSING",
  serviceRoleKey: supabaseServiceRoleKey ? "SET" : "MISSING",
});

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("CRITICAL: Missing required environment variables");
}

const supabase = createClient(supabaseUrl ?? "", supabaseServiceRoleKey ?? "");

// Enable logger
app.use("*", logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Auth middleware to extract user from token
async function getUser(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  if (!token) return null;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error) {
    console.error("Auth error:", error);
    return null;
  }
  return user;
}

// Health check endpoint
app.get("/make-server-7416ca23/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== POSTS ROUTES ====================

// Get all posts
app.get("/make-server-7416ca23/posts", async (c) => {
  try {
    const posts = await kv.getByPrefix("post:");
    const sortedPosts = posts.sort(
      (a: any, b: any) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
    return c.json(sortedPosts.filter((p: any) => p.status === "published"));
  } catch (error) {
    console.error("Error fetching posts:", error);
    return c.json({ error: "Failed to fetch posts" }, 500);
  }
});

// Get single post
app.get("/make-server-7416ca23/posts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const post = await kv.get(`post:${id}`);

    if (!post) {
      return c.json({ error: "Post not found" }, 404);
    }

    // Increment view count
    post.views = (post.views || 0) + 1;
    await kv.set(`post:${id}`, post);

    return c.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return c.json({ error: "Failed to fetch post" }, 500);
  }
});

// Create post
app.post("/make-server-7416ca23/posts", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const user = await getUser(authHeader || null);

    if (!user) {
      return c.json(
        { code: 401, message: "Missing authorization header" },
        401,
      );
    }

    const body = await c.req.json();
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const post = {
      id,
      author_id: user.id,
      author_name: user.email?.split("@")[0] || "Anonymous",
      title: body.title || "Untitled",
      content: body.content || "",
      status: body.status || "draft",
      tags: body.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views: 0,
      reply_count: 0,
    };

    await kv.set(`post:${id}`, post);

    return c.json(post, 201);
  } catch (error) {
    console.error("Error creating post:", error);
    return c.json({ error: "Failed to create post" }, 500);
  }
});

// Update post
app.put("/make-server-7416ca23/posts/:id", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const user = await getUser(authHeader || null);

    if (!user) {
      return c.json(
        { code: 401, message: "Missing authorization header" },
        401,
      );
    }

    const id = c.req.param("id");
    const post = await kv.get(`post:${id}`);

    if (!post) {
      return c.json({ error: "Post not found" }, 404);
    }

    if (post.author_id !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const body = await c.req.json();
    const updatedPost = {
      ...post,
      ...body,
      updated_at: new Date().toISOString(),
    };

    await kv.set(`post:${id}`, updatedPost);

    return c.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    return c.json({ error: "Failed to update post" }, 500);
  }
});

// ==================== COMMENTS ROUTES ====================

// Get comments for a post
app.get("/make-server-7416ca23/posts/:postId/comments", async (c) => {
  try {
    const postId = c.req.param("postId");
    const allComments = await kv.getByPrefix(`comment:${postId}:`);

    return c.json(allComments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return c.json({ error: "Failed to fetch comments" }, 500);
  }
});

// Create comment
app.post("/make-server-7416ca23/posts/:postId/comments", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const user = await getUser(authHeader || null);

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const postId = c.req.param("postId");
    const body = await c.req.json();
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const comment = {
      id,
      post_id: postId,
      parent_id: body.parent_id || null,
      author_id: user.id,
      author_name: user.email?.split("@")[0] || "Anonymous",
      content: body.content || "",
      created_at: new Date().toISOString(),
      upvotes: 0,
    };

    await kv.set(`comment:${postId}:${id}`, comment);

    // Update reply count on post
    const post = await kv.get(`post:${postId}`);
    if (post) {
      post.reply_count = (post.reply_count || 0) + 1;
      await kv.set(`post:${postId}`, post);
    }

    return c.json(comment, 201);
  } catch (error) {
    console.error("Error creating comment:", error);
    return c.json({ error: "Failed to create comment" }, 500);
  }
});

// Upvote comment
app.post("/make-server-7416ca23/comments/:id/vouch", async (c) => {
  try {
    const id = c.req.param("id");
    const { postId } = await c.req.json();

    const comment = await kv.get(`comment:${postId}:${id}`);
    if (!comment) {
      return c.json({ error: "Comment not found" }, 404);
    }

    comment.upvotes = (comment.upvotes || 0) + 1;
    await kv.set(`comment:${postId}:${id}`, comment);

    return c.json(comment);
  } catch (error) {
    console.error("Error vouching comment:", error);
    return c.json({ error: "Failed to vouch comment" }, 500);
  }
});

// ==================== USER/PROFILE ROUTES ====================

// Get user profile
app.get("/make-server-7416ca23/users/:id", async (c) => {
  try {
    const id = c.req.param("id");
    let profile = await kv.get(`profile:${id}`);

    if (!profile) {
      // Create default profile if not exists
      profile = {
        id,
        username: "User_" + id.slice(0, 8),
        bio: "",
        specialization: "General",
        join_date: new Date().toISOString(),
        reputation_score: 0,
        email: "",
      };
      await kv.set(`profile:${id}`, profile);
    }

    // Get user's posts
    const allPosts = await kv.getByPrefix("post:");
    const userPosts = allPosts.filter((p: any) => p.author_id === id);

    return c.json({ ...profile, posts: userPosts });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

// Update user profile
app.put("/make-server-7416ca23/users/:id", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const user = await getUser(authHeader || null);

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");

    if (user.id !== id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const body = await c.req.json();
    let profile = await kv.get(`profile:${id}`);

    if (!profile) {
      profile = {
        id,
        username: "User_" + id.slice(0, 8),
        bio: "",
        specialization: "General",
        join_date: new Date().toISOString(),
        reputation_score: 0,
        email: user.email || "",
      };
    }

    const updatedProfile = { ...profile, ...body };
    await kv.set(`profile:${id}`, updatedProfile);

    return c.json(updatedProfile);
  } catch (error) {
    console.error("Error updating profile:", error);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

// ==================== STATS ROUTES ====================

// Get system stats
app.get("/make-server-7416ca23/stats", async (c) => {
  try {
    const posts = await kv.getByPrefix("post:");
    const profiles = await kv.getByPrefix("profile:");

    // Calculate approximate storage (rough estimate)
    const dataSize =
      JSON.stringify(posts).length + JSON.stringify(profiles).length;
    const kbStored = Math.round(dataSize / 1024);

    return c.json({
      users: profiles.length,
      posts: posts.filter((p: any) => p.status === "published").length,
      kb_stored: kbStored,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return c.json({ error: "Failed to fetch stats" }, 500);
  }
});

// ==================== AUTH ROUTES ====================

// Sign up
app.post("/make-server-7416ca23/auth/signup", async (c) => {
  try {
    const { email, password, username } = await c.req.json();

    console.log("Signup request received:", {
      email,
      username,
      hasPassword: !!password,
    });

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { username },
      email_confirm: true, // Auto-confirm since no email server configured
    });

    if (error) {
      console.error("Supabase auth.admin.createUser error:", error);
      return c.json({ error: error.message }, 400);
    }

    if (!data.user) {
      console.error("No user data returned from createUser");
      return c.json(
        { error: "Failed to create user - no user data returned" },
        500,
      );
    }

    console.log("User created successfully:", data.user.id);

    // Create profile
    const profile = {
      id: data.user.id,
      username: username || email.split("@")[0],
      bio: "",
      specialization: "General",
      join_date: new Date().toISOString(),
      reputation_score: 0,
      email,
    };

    await kv.set(`profile:${data.user.id}`, profile);
    console.log("Profile created for user:", data.user.id);

    return c.json({ user: data.user, profile }, 201);
  } catch (error) {
    console.error("Signup error (catch block):", error);
    return c.json(
      { error: error instanceof Error ? error.message : "Failed to sign up" },
      500,
    );
  }
});

Deno.serve(app.fetch);
