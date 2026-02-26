// localStorage-based data management for demo purposes

export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

export interface Session {
  user: User;
  access_token: string;
}

export interface AccessSession {
  id: string;
  user_id: string;
  timestamp: string;
  browser: string;
  os: string;
  ip_address: string;
  session_duration?: string;
}

// Helper function to get browser info
function getBrowserInfo() {
  const ua = navigator.userAgent;
  let browser = "UNKNOWN";

  if (ua.indexOf("Firefox") > -1) browser = "Mozilla Firefox";
  else if (ua.indexOf("Edg") > -1) browser = "Microsoft Edge";
  else if (ua.indexOf("Chrome") > -1) browser = "Google Chrome";
  else if (ua.indexOf("Safari") > -1) browser = "Apple Safari";
  else if (ua.indexOf("MSIE") > -1 || ua.indexOf("Trident") > -1)
    browser = "Internet Explorer";

  return browser;
}

// Helper function to get OS info
function getOSInfo() {
  const ua = navigator.userAgent;
  let os = "UNKNOWN";

  if (ua.indexOf("Win") > -1) os = "Windows NT";
  else if (ua.indexOf("Mac") > -1) os = "MacOS";
  else if (ua.indexOf("Linux") > -1) os = "Linux";
  else if (ua.indexOf("Android") > -1) os = "Android";
  else if (ua.indexOf("iOS") > -1) os = "iOS";

  return os;
}

// Helper function to generate mock IP
function getMockIP() {
  return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

// Log access session
export function logAccessSession(userId: string) {
  const sessions: AccessSession[] = JSON.parse(
    localStorage.getItem("access_sessions") || "[]",
  );

  const newSession: AccessSession = {
    id: `session-${Date.now()}`,
    user_id: userId,
    timestamp: new Date().toISOString(),
    browser: getBrowserInfo(),
    os: getOSInfo(),
    ip_address: getMockIP(),
  };

  // Add new session
  sessions.push(newSession);

  // Keep only last 50 sessions total (to manage storage)
  if (sessions.length > 50) {
    sessions.splice(0, sessions.length - 50);
  }

  localStorage.setItem("access_sessions", JSON.stringify(sessions));
  localStorage.setItem(`last_login_${userId}`, new Date().toISOString());
}

// Get user's last 5 sessions
export function getUserSessions(
  userId: string,
  limit: number = 5,
): AccessSession[] {
  const sessions: AccessSession[] = JSON.parse(
    localStorage.getItem("access_sessions") || "[]",
  );
  return sessions
    .filter((s) => s.user_id === userId)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, limit);
}

// Update reputation score
export function updateReputation(
  userId: string,
  change: number,
  reason: string,
) {
  const profiles = JSON.parse(localStorage.getItem("profiles") || "[]");
  const profileIndex = profiles.findIndex((p: any) => p.id === userId);

  if (profileIndex !== -1) {
    profiles[profileIndex].reputation_score =
      (profiles[profileIndex].reputation_score || 0) + change;
    localStorage.setItem("profiles", JSON.stringify(profiles));

    // Log reputation change
    const reputationLog = JSON.parse(
      localStorage.getItem("reputation_log") || "[]",
    );
    reputationLog.push({
      user_id: userId,
      change,
      reason,
      timestamp: new Date().toISOString(),
      new_total: profiles[profileIndex].reputation_score,
    });

    // Keep only last 100 reputation changes
    if (reputationLog.length > 100) {
      reputationLog.splice(0, reputationLog.length - 100);
    }

    localStorage.setItem("reputation_log", JSON.stringify(reputationLog));

    return profiles[profileIndex].reputation_score;
  }

  return 0;
}

// Get reputation log for user
export function getUserReputationLog(userId: string, limit: number = 10) {
  const reputationLog = JSON.parse(
    localStorage.getItem("reputation_log") || "[]",
  );
  return reputationLog
    .filter((log: any) => log.user_id === userId)
    .sort(
      (a: any, b: any) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, limit);
}

// Initialize demo data
export function initializeDemoData() {
  if (!localStorage.getItem("initialized")) {
    // Demo users
    const demoUsers: User[] = [
      {
        id: "user-1",
        email: "admin@devexchange.local",
        username: "admin",
        created_at: "2025-01-15T10:00:00Z",
      },
      {
        id: "user-2",
        email: "johndoe@devexchange.local",
        username: "johndoe",
        created_at: "2025-01-16T08:30:00Z",
      },
      {
        id: "user-3",
        email: "janecoder@devexchange.local",
        username: "janecoder",
        created_at: "2025-01-17T14:20:00Z",
      },
    ];

    // Demo profiles
    const demoProfiles = [
      {
        id: "user-1",
        username: "admin",
        email: "admin@devexchange.local",
        bio: "System Administrator and Senior Developer with 15+ years of experience in enterprise software development. Specializing in distributed systems and database architecture.",
        specialization: "Systems Architecture",
        join_date: "2025-01-15T10:00:00Z",
        reputation_score: 2450,
      },
      {
        id: "user-2",
        username: "johndoe",
        email: "johndoe@devexchange.local",
        bio: "Full-stack developer passionate about React and Node.js. Building scalable web applications for the modern enterprise.",
        specialization: "Full-Stack Development",
        join_date: "2025-01-16T08:30:00Z",
        reputation_score: 1820,
      },
      {
        id: "user-3",
        username: "janecoder",
        email: "janecoder@devexchange.local",
        bio: "Frontend specialist with a focus on performance optimization and accessibility. Contributing to open-source projects since 2020.",
        specialization: "Frontend Engineering",
        join_date: "2025-01-17T14:20:00Z",
        reputation_score: 1340,
      },
    ];

    // Demo posts
    const demoPosts = [
      {
        id: "post-1",
        author_id: "user-1",
        author_name: "admin",
        title: "Optimizing Database Queries in High-Traffic Applications",
        content:
          "In enterprise environments, database performance is critical to system reliability. This technical brief examines query optimization strategies including index selection, query plan analysis, and connection pooling methodologies. Based on production deployment data from multiple Fortune 500 implementations, we have identified three key optimization vectors: (1) Selective index creation on frequently-queried columns, (2) Query result caching with appropriate invalidation strategies, (3) Connection pool tuning based on concurrent user load patterns. Performance metrics demonstrate 300-400% improvement in query response times when these strategies are properly implemented.",
        status: "published",
        tags: ["Database", "Performance", "Architecture"],
        created_at: "2025-02-20T09:15:00Z",
        updated_at: "2025-02-20T09:15:00Z",
        views: 342,
        reply_count: 12,
        likes: 28,
        dislikes: 3,
        image_url:
          "https://images.unsplash.com/photo-1744868562210-fffb7fa882d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhYmFzZSUyMHNlcnZlciUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzcyMDEzMjUyfDA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        id: "post-2",
        author_id: "user-2",
        author_name: "johndoe",
        title: "React Server Components: Production Implementation Notes",
        content:
          "After six months of production deployment with React Server Components, our team has compiled comprehensive findings regarding implementation best practices and potential pitfalls. Key observations include significant improvements in initial page load times (averaging 45% reduction) and reduced client-side JavaScript bundle sizes. However, careful consideration must be given to data fetching patterns and cache invalidation strategies. We recommend implementing a hybrid approach where frequently-updated data continues to use client-side fetching while static or slowly-changing content leverages server components. Documentation of our migration process and performance benchmarks is available for internal review.",
        status: "published",
        tags: ["React", "Frontend", "Web Development"],
        created_at: "2025-02-22T14:30:00Z",
        updated_at: "2025-02-22T14:30:00Z",
        views: 256,
        reply_count: 8,
        likes: 19,
        dislikes: 1,
        image_url:
          "https://images.unsplash.com/photo-1653387137517-fbc54d488ed8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWFjdCUyMGNvZGUlMjBwcm9ncmFtbWluZ3xlbnwxfHx8fDE3NzIwMTM2MDN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        id: "post-3",
        author_id: "user-3",
        author_name: "janecoder",
        title: "Accessibility Compliance in Modern Web Applications",
        content:
          "Following recent updates to WCAG 2.2 guidelines, development teams must ensure compliance with enhanced accessibility standards. This memorandum outlines required implementation changes including: proper ARIA label implementation, keyboard navigation support for all interactive elements, sufficient color contrast ratios (minimum 4.5:1 for normal text), and screen reader compatibility testing. Our QA department has developed automated testing protocols using axe-core and Pa11y tools. All production deployments must pass accessibility audits before release approval. Estimated implementation time for existing applications: 40-60 developer hours per major feature module.",
        status: "published",
        tags: ["Accessibility", "Web Standards", "Best Practices"],
        created_at: "2025-02-23T11:00:00Z",
        updated_at: "2025-02-23T11:00:00Z",
        views: 189,
        reply_count: 5,
        likes: 15,
        dislikes: 0,
        image_url:
          "https://images.unsplash.com/photo-1762330475080-fb8363563b5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY2Nlc3NpYmlsaXR5JTIwd2ViJTIwZGVzaWdufGVufDF8fHx8MTc3MjAxMzYwNHww&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        id: "post-4",
        author_id: "user-1",
        author_name: "admin",
        title: "Microservices Architecture: Lessons from Production Deployment",
        content:
          "After two years operating a microservices-based architecture in production, several critical insights have emerged regarding service decomposition, inter-service communication, and operational complexity. While microservices provide benefits in terms of independent deployment and technology stack flexibility, the operational overhead should not be underestimated. Key recommendations: (1) Implement comprehensive distributed tracing from day one, (2) Establish clear service ownership and on-call responsibilities, (3) Invest heavily in automated testing infrastructure, (4) Design for failure with circuit breakers and fallback mechanisms. Total cost of ownership increased by approximately 35% compared to monolithic predecessor, primarily due to infrastructure and monitoring requirements.",
        status: "published",
        tags: ["Architecture", "Microservices", "DevOps"],
        created_at: "2025-02-24T16:45:00Z",
        updated_at: "2025-02-24T16:45:00Z",
        views: 412,
        reply_count: 15,
        likes: 32,
        dislikes: 7,
        image_url:
          "https://images.unsplash.com/photo-1664526937033-fe2c11f1be25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWNyb3NlcnZpY2VzJTIwYXJjaGl0ZWN0dXJlJTIwZGlhZ3JhbXxlbnwxfHx8fDE3NzE5NTEzMjJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        id: "post-5",
        author_id: "user-2",
        author_name: "johndoe",
        title: "TypeScript Strict Mode Migration Strategy",
        content:
          "Enabling TypeScript strict mode in legacy codebases requires careful planning and phased implementation to avoid disrupting ongoing development. Our team successfully migrated 200,000+ lines of TypeScript code over a six-month period using the following approach: Phase 1 - Enable strict mode for new files only, Phase 2 - Migrate utility functions and shared libraries, Phase 3 - Update feature modules in priority order, Phase 4 - Address remaining technical debt. The migration resulted in identification and resolution of 1,247 potential runtime errors, including 89 critical bugs that had evaded previous testing. Developer productivity initially decreased by 15% but recovered within three weeks as team members adapted to stricter type checking.",
        status: "published",
        tags: ["TypeScript", "Code Quality", "Best Practices"],
        created_at: "2025-02-25T10:20:00Z",
        updated_at: "2025-02-25T10:20:00Z",
        views: 178,
        reply_count: 6,
        likes: 21,
        dislikes: 2,
        image_url:
          "https://images.unsplash.com/photo-1770734360042-676ef707d022?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0eXBlc2NyaXB0JTIwY29kZSUyMGVkaXRvcnxlbnwxfHx8fDE3NzE5MjUxODN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      },
    ];

    // Demo comments
    const demoComments = [
      {
        id: "comment-1",
        post_id: "post-1",
        parent_id: null,
        author_id: "user-2",
        author_name: "johndoe",
        content:
          "Excellent analysis on query optimization. We implemented similar strategies in our e-commerce platform and saw comparable performance improvements. One additional consideration: prepared statements can also help with both performance and security.",
        created_at: "2025-02-20T10:30:00Z",
        upvotes: 8,
      },
      {
        id: "comment-2",
        post_id: "post-1",
        parent_id: "comment-1",
        author_id: "user-1",
        author_name: "admin",
        content:
          "Valid point regarding prepared statements. We have standardized on prepared statements across all database access layers. The performance benefit is measurable, particularly for frequently-executed queries.",
        created_at: "2025-02-20T11:15:00Z",
        upvotes: 5,
      },
      {
        id: "comment-3",
        post_id: "post-2",
        parent_id: null,
        author_id: "user-3",
        author_name: "janecoder",
        content:
          "The 45% reduction in initial load time is impressive. Did you encounter any issues with state management between server and client components? We are evaluating RSC for our next major release.",
        created_at: "2025-02-22T15:45:00Z",
        upvotes: 6,
      },
      {
        id: "comment-4",
        post_id: "post-3",
        parent_id: null,
        author_id: "user-1",
        author_name: "admin",
        content:
          "Accessibility compliance is non-negotiable for enterprise applications. Your automated testing approach is sound. We have mandated similar requirements for all production deployments.",
        created_at: "2025-02-23T12:30:00Z",
        upvotes: 4,
      },
    ];

    // Store demo data
    localStorage.setItem("users", JSON.stringify(demoUsers));
    localStorage.setItem("profiles", JSON.stringify(demoProfiles));
    localStorage.setItem("posts", JSON.stringify(demoPosts));
    localStorage.setItem("comments", JSON.stringify(demoComments));
    localStorage.setItem("initialized", "true");

    // Set passwords for demo users (in real app, these would be hashed)
    localStorage.setItem(
      "passwords",
      JSON.stringify({
        "admin@devexchange.local": "admin123",
        "johndoe@devexchange.local": "password123",
        "janecoder@devexchange.local": "password123",
      }),
    );
  }
}

// Auth functions
export function login(
  email: string,
  password: string,
): { session: Session | null; error: string | null } {
  const passwords = JSON.parse(localStorage.getItem("passwords") || "{}");
  const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");

  if (passwords[email] === password) {
    const user = users.find((u) => u.email === email);
    if (user) {
      const session: Session = {
        user,
        access_token: `demo-token-${user.id}`,
      };
      localStorage.setItem("session", JSON.stringify(session));

      // Log the access session
      logAccessSession(user.id);

      return { session, error: null };
    }
  }

  return { session: null, error: "Invalid login credentials" };
}

export function signup(
  email: string,
  password: string,
  username: string,
): { session: Session | null; error: string | null } {
  const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");
  const profiles = JSON.parse(localStorage.getItem("profiles") || "[]");
  const passwords = JSON.parse(localStorage.getItem("passwords") || "{}");

  // Check if user already exists
  if (users.find((u) => u.email === email)) {
    return { session: null, error: "User already exists" };
  }

  // Create new user
  const newUser: User = {
    id: `user-${Date.now()}`,
    email,
    username: username || email.split("@")[0],
    created_at: new Date().toISOString(),
  };

  const newProfile = {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    bio: "",
    specialization: "General",
    join_date: newUser.created_at,
    reputation_score: 0,
  };

  users.push(newUser);
  profiles.push(newProfile);
  passwords[email] = password;

  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("profiles", JSON.stringify(profiles));
  localStorage.setItem("passwords", JSON.stringify(passwords));

  const session: Session = {
    user: newUser,
    access_token: `demo-token-${newUser.id}`,
  };
  localStorage.setItem("session", JSON.stringify(session));

  return { session, error: null };
}

export function logout() {
  localStorage.removeItem("session");
}

export function getSession(): Session | null {
  const sessionStr = localStorage.getItem("session");
  return sessionStr ? JSON.parse(sessionStr) : null;
}

export function getCurrentUser(): User | null {
  const session = getSession();
  return session?.user || null;
}

// Data functions
export function getPosts() {
  return JSON.parse(localStorage.getItem("posts") || "[]");
}

export function getPost(id: string) {
  const posts = getPosts();
  const post = posts.find((p: any) => p.id === id);
  if (post) {
    // Increment view count
    post.views = (post.views || 0) + 1;
    const updatedPosts = posts.map((p: any) => (p.id === id ? post : p));
    localStorage.setItem("posts", JSON.stringify(updatedPosts));
  }
  return post;
}

export function createPost(data: any) {
  const user = getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const posts = getPosts();
  const newPost = {
    id: `post-${Date.now()}`,
    author_id: user.id,
    author_name: user.username,
    title: data.title || "Untitled",
    content: data.content || "",
    status: data.status || "draft",
    tags: data.tags || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    views: 0,
    reply_count: 0,
    likes: 0,
    dislikes: 0,
    image_url: data.image_url || "",
  };

  posts.push(newPost);
  localStorage.setItem("posts", JSON.stringify(posts));
  return newPost;
}

export function updatePost(id: string, data: any) {
  const user = getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const posts = getPosts();
  const postIndex = posts.findIndex((p: any) => p.id === id);

  if (postIndex === -1) throw new Error("Post not found");
  if (posts[postIndex].author_id !== user.id) throw new Error("Forbidden");

  posts[postIndex] = {
    ...posts[postIndex],
    ...data,
    updated_at: new Date().toISOString(),
  };

  localStorage.setItem("posts", JSON.stringify(posts));
  return posts[postIndex];
}

export function deletePost(id: string) {
  const user = getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const posts = getPosts();
  const postIndex = posts.findIndex((p: any) => p.id === id);

  if (postIndex === -1) throw new Error("Post not found");
  if (posts[postIndex].author_id !== user.id) throw new Error("Forbidden");

  // Remove the post
  const updatedPosts = posts.filter((p: any) => p.id !== id);
  localStorage.setItem("posts", JSON.stringify(updatedPosts));

  // Remove associated comments
  const comments = JSON.parse(localStorage.getItem("comments") || "[]");
  const updatedComments = comments.filter((c: any) => c.post_id !== id);
  localStorage.setItem("comments", JSON.stringify(updatedComments));

  return true;
}

export function likePost(postId: string) {
  const user = getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const posts = getPosts();
  const post = posts.find((p: any) => p.id === postId);
  if (!post) throw new Error("Post not found");

  // Track likes per user
  const userLikes = JSON.parse(localStorage.getItem("user_likes") || "{}");
  const userKey = `${user.id}_${postId}`;

  if (!userLikes[userKey]) {
    userLikes[userKey] = "like";
    post.likes = (post.likes || 0) + 1;
  } else if (userLikes[userKey] === "like") {
    // Remove like
    delete userLikes[userKey];
    post.likes = Math.max((post.likes || 0) - 1, 0);
  } else if (userLikes[userKey] === "dislike") {
    // Switch from dislike to like
    userLikes[userKey] = "like";
    post.dislikes = Math.max((post.dislikes || 0) - 1, 0);
    post.likes = (post.likes || 0) + 1;
  }

  localStorage.setItem("user_likes", JSON.stringify(userLikes));
  localStorage.setItem("posts", JSON.stringify(posts));

  return { post, userVote: userLikes[userKey] };
}

export function dislikePost(postId: string) {
  const user = getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const posts = getPosts();
  const post = posts.find((p: any) => p.id === postId);
  if (!post) throw new Error("Post not found");

  // Track likes per user
  const userLikes = JSON.parse(localStorage.getItem("user_likes") || "{}");
  const userKey = `${user.id}_${postId}`;

  if (!userLikes[userKey]) {
    userLikes[userKey] = "dislike";
    post.dislikes = (post.dislikes || 0) + 1;
  } else if (userLikes[userKey] === "dislike") {
    // Remove dislike
    delete userLikes[userKey];
    post.dislikes = Math.max((post.dislikes || 0) - 1, 0);
  } else if (userLikes[userKey] === "like") {
    // Switch from like to dislike
    userLikes[userKey] = "dislike";
    post.likes = Math.max((post.likes || 0) - 1, 0);
    post.dislikes = (post.dislikes || 0) + 1;
  }

  localStorage.setItem("user_likes", JSON.stringify(userLikes));
  localStorage.setItem("posts", JSON.stringify(posts));

  return { post, userVote: userLikes[userKey] };
}

export function getUserVote(postId: string) {
  const user = getCurrentUser();
  if (!user) return null;

  const userLikes = JSON.parse(localStorage.getItem("user_likes") || "{}");
  const userKey = `${user.id}_${postId}`;
  return userLikes[userKey] || null;
}

export function getComments(postId: string) {
  const comments = JSON.parse(localStorage.getItem("comments") || "[]");
  return comments.filter((c: any) => c.post_id === postId);
}

export function createComment(postId: string, data: any) {
  const user = getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const comments = JSON.parse(localStorage.getItem("comments") || "[]");
  const posts = getPosts();

  const newComment = {
    id: `comment-${Date.now()}`,
    post_id: postId,
    parent_id: data.parent_id || null,
    author_id: user.id,
    author_name: user.username,
    content: data.content || "",
    created_at: new Date().toISOString(),
    upvotes: 0,
  };

  comments.push(newComment);
  localStorage.setItem("comments", JSON.stringify(comments));

  // Update reply count on post
  const postIndex = posts.findIndex((p: any) => p.id === postId);
  if (postIndex !== -1) {
    posts[postIndex].reply_count = (posts[postIndex].reply_count || 0) + 1;
    localStorage.setItem("posts", JSON.stringify(posts));
  }

  return newComment;
}

export function vouchComment(commentId: string, postId: string) {
  const comments = JSON.parse(localStorage.getItem("comments") || "[]");
  const commentIndex = comments.findIndex(
    (c: any) => c.id === commentId && c.post_id === postId,
  );

  if (commentIndex === -1) throw new Error("Comment not found");

  comments[commentIndex].upvotes = (comments[commentIndex].upvotes || 0) + 1;
  localStorage.setItem("comments", JSON.stringify(comments));
  return comments[commentIndex];
}

export function getProfile(id: string) {
  const profiles = JSON.parse(localStorage.getItem("profiles") || "[]");
  const profile = profiles.find((p: any) => p.id === id);

  if (!profile) {
    // Create default profile
    const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find((u) => u.id === id);
    if (user) {
      const newProfile = {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: "",
        specialization: "General",
        join_date: user.created_at,
        reputation_score: 0,
      };
      profiles.push(newProfile);
      localStorage.setItem("profiles", JSON.stringify(profiles));
      return newProfile;
    }
    return null;
  }

  const posts = getPosts();
  const userPosts = posts.filter((p: any) => p.author_id === id);

  return { ...profile, posts: userPosts };
}

export function getProfiles() {
  return JSON.parse(localStorage.getItem("profiles") || "[]");
}

export function updateProfile(id: string, data: any) {
  const user = getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  if (user.id !== id) throw new Error("Forbidden");

  const profiles = JSON.parse(localStorage.getItem("profiles") || "[]");
  const profileIndex = profiles.findIndex((p: any) => p.id === id);

  if (profileIndex === -1) throw new Error("Profile not found");

  profiles[profileIndex] = {
    ...profiles[profileIndex],
    ...data,
  };

  localStorage.setItem("profiles", JSON.stringify(profiles));
  return profiles[profileIndex];
}

export function getStats() {
  const posts = getPosts();
  const profiles = JSON.parse(localStorage.getItem("profiles") || "[]");

  const publishedPosts = posts.filter((p: any) => p.status === "published");
  const dataSize =
    JSON.stringify(posts).length + JSON.stringify(profiles).length;

  return {
    users: profiles.length,
    posts: publishedPosts.length,
    kb_stored: Math.round(dataSize / 1024),
  };
}
