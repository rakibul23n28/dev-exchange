import { createBrowserRouter } from "react-router";
import { MainLayout } from "../components/layout/MainLayout";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import { PostView } from "./pages/PostView";
import { PostEditor } from "./pages/PostEditor";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { RSSFeed } from "./pages/RSSFeed";
import { PublicRoute } from "./components/auth/PublicRoute";
import { PrivateRoute } from "./components/auth/PrivateRoute";

// 404 Not Found component
function NotFound() {
  return (
    <div className="terminal-output p-8">
      <pre className="text-2xl mb-4">ERROR 404: RESOURCE NOT FOUND</pre>
      <pre>The requested URL does not exist in the system.</pre>
      <pre className="mt-4">
        <a href="/" className="text-[#00FF00] underline">
          &gt;&gt; RETURN TO MAIN TERMINAL
        </a>
      </pre>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Home },
      { path: "post/:id", Component: PostView },
      {
        path: "new",
        element: (
          <PrivateRoute>
            <PostEditor />
          </PrivateRoute>
        ),
      },
      { path: "edit/:id", Component: PostEditor },
      { path: "profile/:id", Component: Profile },
      { path: "profile/rss/:id", Component: RSSFeed },
      {
        path: "dashboard",
        element: (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        ),
      },
      { path: "*", Component: NotFound },
    ],
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicRoute>
        <Signup />
      </PublicRoute>
    ),
  },
]);
