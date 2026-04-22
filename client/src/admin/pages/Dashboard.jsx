import { useState, useEffect } from "react";
import { API } from "../../config";

function Dashboard() {
  const [file, setFile] = useState(null);
  const [album, setAlbum] = useState("");
  const [albums, setAlbums] = useState([]);
  const [images, setImages] = useState([]);

  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  /* ================= FETCH ================= */

  const fetchAlbums = async () => {
    try {
      const res = await fetch(`${API}/api/albums`);
      const data = await res.json();

      if (res.ok) {
        setAlbums(data);
        if (data.length > 0 && !album) {
          setAlbum(data[0].slug);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchImages = async () => {
    if (!album) return;

    try {
      const res = await fetch(`${API}/api/gallery/${album}`);
      const data = await res.json();

      if (res.ok) {
        setImages(data.images || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  useEffect(() => {
    fetchImages();
  }, [album]);

  /* ================= IMAGE COMPRESSION ================= */

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => (img.src = e.target.result);

      img.onload = () => {
        const canvas = document.createElement("canvas");

        const maxWidth = 2000;
        const scale = maxWidth / img.width;

        canvas.width = maxWidth;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            const compressed = new File([blob], file.name, {
              type: "image/jpeg",
            });
            resolve(compressed);
          },
          "image/jpeg",
          0.7
        );
      };

      reader.readAsDataURL(file);
    });
  };

  /* ================= ACTIONS ================= */

  const handleCreateAlbum = async () => {
    if (!newTitle || !newSlug) return alert("Fill both fields");

    try {
      const token = localStorage.getItem("admin_token");

      const res = await fetch(`${API}/api/albums`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTitle, slug: newSlug }),
      });

      const data = await res.json();

      if (!res.ok) return alert(data.message);

      alert("✅ Album created");
      setNewTitle("");
      setNewSlug("");
      fetchAlbums();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAlbum = async (id) => {
    if (!window.confirm("Delete album?")) return;

    try {
      const token = localStorage.getItem("admin_token");

      const res = await fetch(`${API}/api/albums/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) return alert(data.message);

      fetchAlbums();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= UPLOAD ================= */

  const handleUpload = async () => {
    if (!file) return alert("Select image");

    try {
      setLoading(true);

      const compressed = await compressImage(file);

      const formData = new FormData();
      formData.append("image", compressed);

      const token = localStorage.getItem("admin_token");

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API}/api/gallery/upload/${album}`);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setProgress(percent);
        }
      };

      xhr.onload = () => {
        setLoading(false);
        setProgress(0);

        if (xhr.status === 200) {
          alert("✅ Uploaded successfully");
          setFile(null);
          fetchImages();
        } else {
          alert("Upload failed");
        }
      };

      xhr.send(formData);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
      setLoading(false);
    }
  };

  const handleDeleteImage = async (url) => {
    if (!window.confirm("Delete image?")) return;

    try {
      const token = localStorage.getItem("admin_token");

      await fetch(`${API}/api/gallery/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url }),
      });

      setImages((prev) => prev.filter((img) => img.url !== url));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    window.location.href = "/admin/login";
  };

  /* ================= UI ================= */

  return (
    <div style={wrapper}>
      <div style={container}>
        <div style={header}>
          <h1>🚀 Admin Dashboard</h1>
          <button onClick={handleLogout} style={logoutBtn}>
            Logout
          </button>
        </div>

        {/* CREATE */}
        <div style={card}>
          <h3>📁 Create Album</h3>
          <div style={row}>
            <input placeholder="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} style={input} />
            <input placeholder="Slug" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} style={input} />
            <button onClick={handleCreateAlbum} style={primaryBtn}>Create</button>
          </div>
        </div>

        {/* ALBUM LIST */}
        <div style={card}>
          <h3>📚 Albums</h3>
          {albums.map((a) => (
            <div key={a._id} style={albumRow}>
              <span>{a.title} ({a.slug})</span>
              <button onClick={() => handleDeleteAlbum(a._id)} style={dangerBtn}>Delete</button>
            </div>
          ))}
        </div>

        {/* UPLOAD */}
        <div style={card}>
          <h3>📤 Upload Image</h3>

          {/* Drag Drop */}
          <div
            style={dropZone}
            onDrop={(e) => {
              e.preventDefault();
              setFile(e.dataTransfer.files[0]);
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            {file ? file.name : "Drag & Drop or Click"}
          </div>

          <div style={row}>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />

            <select value={album} onChange={(e) => setAlbum(e.target.value)} style={input}>
              {albums.map((a) => (
                <option key={a._id} value={a.slug}>{a.title}</option>
              ))}
            </select>

            <button onClick={handleUpload} style={primaryBtn}>
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>

          {/* Progress */}
          {loading && (
            <div style={progressBar}>
              <div style={{ ...progressFill, width: `${progress}%` }} />
            </div>
          )}
        </div>

        {/* IMAGES */}
        <div style={card}>
          <h3>📸 Uploaded Images</h3>

          <div style={grid}>
            {images.map((img) => (
              <div key={img.url} style={imageCard}>
                <img src={img.url} style={image} />
                <button onClick={() => handleDeleteImage(img.url)} style={dangerBtnFull}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const wrapper = { minHeight: "100vh", background: "#020617", padding: "30px" };
const container = { maxWidth: "1000px", margin: "auto" };
const header = { display: "flex", justifyContent: "space-between" };
const card = { background: "#0f172a", padding: "20px", borderRadius: "12px", marginBottom: "20px" };
const row = { display: "flex", gap: "10px", flexWrap: "wrap" };
const input = { padding: "10px", borderRadius: "6px" };
const primaryBtn = { background: "#22c55e", padding: "10px", borderRadius: "6px", cursor: "pointer" };
const dangerBtn = { background: "#ef4444", padding: "6px", borderRadius: "6px" };
const dangerBtnFull = { marginTop: "6px", width: "100%", background: "#ef4444", padding: "6px", borderRadius: "6px" };
const logoutBtn = { padding: "6px 12px" };
const albumRow = { display: "flex", justifyContent: "space-between", marginTop: "8px" };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" };
const imageCard = { background: "#020617", padding: "8px", borderRadius: "8px" };
const image = { width: "100%", borderRadius: "6px" };

const dropZone = {
  border: "2px dashed #22c55e",
  padding: "20px",
  marginBottom: "10px",
  borderRadius: "10px",
  textAlign: "center",
  cursor: "pointer",
};

const progressBar = {
  height: "8px",
  background: "#111",
  marginTop: "10px",
  borderRadius: "5px",
};

const progressFill = {
  height: "100%",
  background: "#22c55e",
  borderRadius: "5px",
};

export default Dashboard;