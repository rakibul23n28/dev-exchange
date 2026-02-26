import { Post, User } from "./localStorage";

export function generateRSS(user: any, posts: Post[]): string {
  const domain = window.location.origin;
  const profileUrl = `${domain}/profile/${user.id}`;
  const feedUrl = `${domain}/rss/${user.id}`;
  const currentYear = new Date().getFullYear();

  const items = posts
    .filter((post) => post.status === "published")
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .map((post) => {
      const postUrl = `${domain}/post/${post.id}`;
      const categories =
        post.tags && post.tags.length > 0
          ? post.tags
              .map(
                (tag) => `
      <category>${tag}</category>`,
              )
              .join("")
          : "";

      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${post.content.substring(0, 300)}${post.content.length > 300 ? "..." : ""}]]></description>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
      <author>${user.email} (${user.username})</author>${categories}
    </item>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${user.username}'s Blog - The Dev Exchange</title>
    <link>${profileUrl}</link>
    <description>${user.bio || `Latest posts from ${user.username} on The Dev Exchange`}</description>
    <language>en-us</language>
    <copyright>Copyright ${currentYear} ${user.username}</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;
}
