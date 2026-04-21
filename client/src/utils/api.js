import { API } from "../config";

// 🔹 Fetch all albums
export const fetchAlbums = async () => {
  const res = await fetch(`${API}/api/gallery`);
  if (!res.ok) throw new Error("Failed to fetch albums");
  return res.json();
};

// 🔹 Fetch single album
export const fetchAlbum = async (id) => {
  const res = await fetch(`${API}/api/gallery/${id}`);
  if (!res.ok) throw new Error("Failed to fetch album");
  return res.json();
};