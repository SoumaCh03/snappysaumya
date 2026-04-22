import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Navbar from "./components/layout/Navbar";
import MusicPlayer from "./components/ui/MusicPlayer";
import Hero from "./components/sections/Hero";
import Albums from "./components/sections/Albums";
import Contact from "./components/sections/Contact";
import Footer from "./components/layout/Footer";

// Admin
import Login from "./admin/pages/Login";
import Dashboard from "./admin/pages/Dashboard";
import ProtectedRoute from "./admin/components/ProtectedRoute";
import ForgotPassword from "./admin/pages/ForgotPassword";
import ResetPassword from "./admin/pages/ResetPassword";

// Gallery
import Gallery from "./pages/Gallery";

function App() {
  const location = useLocation();

  // 🔥 Detect admin route
  const isAdminRoute = location.pathname.startsWith("/admin");

  // ⌨️ Keyboard shortcut (Ctrl + Shift + A)
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
        window.location.href = "/admin/login";
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* 🔥 Public Layout Only */}
      {!isAdminRoute && <Navbar />}
      {!isAdminRoute && <MusicPlayer />}

      <Routes>
        {/* 🏠 Homepage */}
        <Route
          path="/"
          element={
            <>
              <Hero />
              <Albums />
              <Contact />
            </>
          }
        />

        {/* 📸 Gallery */}
        <Route path="/gallery/:id" element={<Gallery />} />

        {/* 🔐 Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/forgot" element={<ForgotPassword />} />
        <Route path="/admin/reset" element={<ResetPassword />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* 🔥 Footer only for public */}
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;