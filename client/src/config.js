export const API =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : "https://snappysaumya-production.up.railway.app";