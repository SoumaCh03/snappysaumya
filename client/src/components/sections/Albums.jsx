import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../config";

function Albums() {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/gallery`)
      .then((res) => res.json())
      .then((data) => {
        setAlbums(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching albums:", err);
        setLoading(false);
      });
  }, []);

  const scroll = (direction) => {
    if (!scrollRef.current) return;

    const amount = 420;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section id="albums" className="albums-section">
      <h2 className="section-title">Featured Albums</h2>

      <div className="album-controls">
        <button className="arrow-btn pulse-arrow" onClick={() => scroll("left")}>
          ←
        </button>

        <button className="arrow-btn pulse-arrow" onClick={() => scroll("right")}>
          →
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading albums...</p>
      ) : (
        <div className="albums-grid" ref={scrollRef}>
          {albums.map((album) => (
            <div
              className="album-card"
              key={album.id}
              onClick={() => navigate(`/gallery/${album.id}`)}
              style={{
                backgroundImage: `url(${album.cover.replace('/upload/', '/upload/q_auto,f_auto/')})`, // ✅ FIXED
                cursor: "pointer",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="album-overlay">
                <h3>{album.title}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Albums;