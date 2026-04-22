import { Routes, Route } from "react-router-dom";
import App from "../App";

export default function AppRoutes() {
  return (
    <Routes>
      {/* 🔥 Send ALL routes to App */}
      <Route path="/*" element={<App />} />
    </Routes>
  );
}