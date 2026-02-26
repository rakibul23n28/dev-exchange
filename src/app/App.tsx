import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { initializeDemoData } from "../lib/localStorage";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";

export default function App() {
  useEffect(() => {
    // Initialize demo data on first load
    initializeDemoData();
  }, []);

  return (
    <>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AuthProvider>
    </>
  );
}
