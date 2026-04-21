import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "../App";
import Gallery from "../pages/Gallery";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/gallery/:id" element={<Gallery />} />
      </Routes>
    </BrowserRouter>
  );
}