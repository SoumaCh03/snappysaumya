import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import EXIF from "exif-js";
import Masonry from "react-masonry-css";
import { API } from "../config";

const hasLikedInStorage = (url) => {
  if (typeof window === "undefined") return false;

  try {
    return window.localStorage.getItem(`liked_${url}`) === "true";
  } catch {
    return false;
  }
};

const toNumber = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (
    value &&
    typeof value === "object" &&
    typeof value.numerator === "number" &&
    typeof value.denominator === "number" &&
    value.denominator !== 0
  ) {
    return value.numerator / value.denominator;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatAperture = (value) => {
  const numeric = toNumber(value);

  if (numeric === null) return "--";
  return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(1);
};

const formatShutter = (value) => {
  const numeric = toNumber(value);

  if (numeric === null || numeric <= 0) return "--";

  if (numeric >= 1) {
    return `${numeric.toFixed(1).replace(/\.0$/, "")}s`;
  }

  return `1/${Math.round(1 / numeric)}s`;
};

function Gallery() {
  const { id } = useParams();

  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [exifData, setExifData] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [likes, setLikes] = useState({});
  const [likedImages, setLikedImages] = useState({});
  const [pendingLikes, setPendingLikes] = useState({});

  const touchStartX = useRef(0);

  const images = Array.isArray(album?.images) ? album.images : [];
  const visibleImages = images.slice(0, visibleCount);
  const selectedImage =
    selectedIndex !== null && selectedIndex >= 0 && selectedIndex < images.length
      ? images[selectedIndex]
      : null;

  const closeLightbox = () => {
    setSelectedIndex(null);
    setZoom(1);
    setExifData(null);
  };

  const openImage = (index) => {
    if (index < 0 || index >= images.length) return;
    setSelectedIndex(index);
    setZoom(1);
    setExifData(null);
  };

  const nextImage = () => {
    if (!images.length) return;

    setZoom(1);
    setExifData(null);
    setSelectedIndex((prev) => {
      if (prev === null) return 0;
      return prev === images.length - 1 ? 0 : prev + 1;
    });
  };

  const prevImage = () => {
    if (!images.length) return;

    setZoom(1);
    setExifData(null);
    setSelectedIndex((prev) => {
      if (prev === null) return images.length - 1;
      return prev === 0 ? images.length - 1 : prev - 1;
    });
  };

  const handleTouchStart = (e) => {
    if (!e.touches?.length) return;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!selectedImage || !e.changedTouches?.length) return;

    const diff = touchStartX.current - e.changedTouches[0].clientX;

    if (diff > 50) nextImage();
    if (diff < -50) prevImage();
  };

  const handleRipple = (e) => {
    const el = e.currentTarget;
    el.classList.remove("active");
    void el.offsetWidth;
    el.classList.add("active");
  };

  const extractColor = (img) => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      canvas.width = 1;
      canvas.height = 1;
      ctx.drawImage(img, 0, 0, 1, 1);

      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      img.style.boxShadow = `0 0 40px rgb(${r}, ${g}, ${b})`;
    } catch {
      // Ignore image/canvas failures, including cross-origin restrictions.
    }
  };

  const handleLike = async (e, imageUrl) => {
    e.stopPropagation();

    if (!imageUrl || likedImages[imageUrl] || pendingLikes[imageUrl]) {
      return;
    }

    handleRipple(e);
    setPendingLikes((prev) => ({ ...prev, [imageUrl]: true }));
    setLikedImages((prev) => ({ ...prev, [imageUrl]: true }));

    try {
      const res = await fetch(`${API}/api/gallery/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageUrl }),
      });

      if (!res.ok) {
        throw new Error(`Failed to like image (${res.status})`);
      }

      const data = await res.json();

      setLikes((prev) => {
        const currentLikes = Number(prev[imageUrl]) || 0;

        return {
          ...prev,
          [imageUrl]:
            typeof data?.likes === "number" ? data.likes : currentLikes + 1,
        };
      });

      try {
        window.localStorage.setItem(`liked_${imageUrl}`, "true");
      } catch {
        // Ignore storage failures.
      }
    } catch (err) {
      console.error(err);
      setLikedImages((prev) => {
        const next = { ...prev };
        delete next[imageUrl];
        return next;
      });
    } finally {
      setPendingLikes((prev) => {
        const next = { ...prev };
        delete next[imageUrl];
        return next;
      });
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError("");
    setAlbum(null);
    setVisibleCount(6);
    setSelectedIndex(null);
    setZoom(1);
    setExifData(null);
    setLikedImages({});
    setPendingLikes({});

    if (!id) {
      setLoading(false);
      setError("Gallery not found.");
      return () => controller.abort();
    }

    fetch(`${API}/api/gallery/${id}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load gallery (${res.status})`);
        }

        const raw = await res.json();
        const normalized =
          raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};

        return {
          ...normalized,
          images: Array.isArray(normalized.images)
            ? normalized.images.filter((imgObj) => imgObj?.url)
            : [],
        };
      })
      .then((data) => {
        setAlbum(data);

        const nextLikedImages = {};
        data.images.forEach((imgObj) => {
          if (hasLikedInStorage(imgObj.url)) {
            nextLikedImages[imgObj.url] = true;
          }
        });

        setLikedImages(nextLikedImages);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error(err);
        setError("Failed to load gallery.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API}/api/gallery/likes`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) return {};

        const raw = await res.json();
        return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
      })
      .then((data) => {
        setLikes(data);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error(err);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!images.length || visibleCount >= images.length) return;

    const handleScroll = () => {
      const scrollHeight = Math.max(
        document.body.offsetHeight,
        document.documentElement.offsetHeight
      );

      if (window.innerHeight + window.scrollY >= scrollHeight - 300) {
        setVisibleCount((prev) => Math.min(prev + 3, images.length));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visibleCount, images.length]);

  useEffect(() => {
    if (!images.length) return;

    const preloadBatch = images.slice(0, Math.min(images.length, visibleCount + 6));

    preloadBatch.forEach((imgObj) => {
      const img = new Image();
      img.src = imgObj.url;
    });
  }, [images, visibleCount]);

  useEffect(() => {
    if (!selectedImage?.url) {
      setExifData(null);
      return;
    }

    let cancelled = false;
    const img = new Image();

    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        EXIF.getData(img, function () {
          if (cancelled) return;

          const aperture = EXIF.getTag(this, "FNumber");
          const shutter = EXIF.getTag(this, "ExposureTime");

          setExifData({
            camera: EXIF.getTag(this, "Model") || "Camera N/A",
            iso: EXIF.getTag(this, "ISOSpeedRatings") || "--",
            aperture: formatAperture(aperture),
            shutter: formatShutter(shutter),
          });
        });
      } catch {
        if (!cancelled) {
          setExifData(null);
        }
      }
    };

    img.onerror = () => {
      if (!cancelled) {
        setExifData(null);
      }
    };

    img.src = selectedImage.url;

    return () => {
      cancelled = true;
    };
  }, [selectedImage?.url]);

  useEffect(() => {
    if (selectedIndex === null || !images.length) return;

    const handleKey = (e) => {
      if (e.key === "Escape") {
        setSelectedIndex(null);
        setZoom(1);
        setExifData(null);
        return;
      }

      if (e.key === "ArrowRight") {
        setZoom(1);
        setExifData(null);
        setSelectedIndex((prev) => {
          if (prev === null) return 0;
          return prev === images.length - 1 ? 0 : prev + 1;
        });
      }

      if (e.key === "ArrowLeft") {
        setZoom(1);
        setExifData(null);
        setSelectedIndex((prev) => {
          if (prev === null) return images.length - 1;
          return prev === 0 ? images.length - 1 : prev - 1;
        });
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIndex, images.length]);

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading gallery...</p>;
  }

  if (error) {
    return <p style={{ textAlign: "center" }}>{error}</p>;
  }

  if (!album) {
    return <p style={{ textAlign: "center" }}>Gallery not found.</p>;
  }

  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 1,
  };

  return (
    <div className="gallery-page">
      <h1 className="gallery-title">{album.title}</h1>

      {images.length === 0 ? (
        <p style={{ textAlign: "center" }}>No images found in this gallery.</p>
      ) : (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="masonry-grid"
          columnClassName="masonry-column"
        >
          {visibleImages.map((imgObj, index) => {
            const imageUrl = imgObj.url;
            const isLiked = Boolean(likedImages[imageUrl]);
            const isPending = Boolean(pendingLikes[imageUrl]);
            const isDisabled = isLiked || isPending;

            return (
              <div
                key={imageUrl}
                className="gallery-item"
                style={{ marginBottom: "20px" }}
              >
                <img
                  src={imageUrl}
                  alt={imgObj.title || `Gallery image ${index + 1}`}
                  loading="lazy"
                  onClick={() => openImage(index)}
                  onContextMenu={(e) => e.preventDefault()}
                  draggable="false"
                  className="gallery-img"
                  onLoad={(e) => {
                    e.currentTarget.classList.add("loaded");
                    extractColor(e.currentTarget);
                  }}
                />

                <div style={{ fontSize: "12px", opacity: 0.6 }}>
                  {Array.isArray(imgObj.tags) ? imgObj.tags.join(", ") : ""}
                </div>

                <button
                  type="button"
                  className="ripple like-btn"
                  disabled={isDisabled}
                  style={{
                    marginTop: "5px",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    opacity: isDisabled ? 0.6 : 1,
                  }}
                  onClick={(e) => handleLike(e, imageUrl)}
                >
                  ❤️ {likes[imageUrl] || 0} {isLiked ? "✔" : ""}
                </button>
              </div>
            );
          })}
        </Masonry>
      )}

      {selectedImage && (
        <div
          className="lightbox"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            type="button"
            className="nav-btn left magnetic ripple"
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation();
              handleRipple(e);
              prevImage();
            }}
          >
            ‹
          </button>

          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div className="watermark">© SnappySaumya</div>

            <img
              src={selectedImage.url}
              alt={selectedImage.title || `Gallery image ${selectedIndex + 1}`}
              className="lightbox-img"
              style={{ transform: `scale(${zoom})` }}
              draggable="false"
            />

            <h2 className="image-title">Image {selectedIndex + 1}</h2>

            <p className="exif">
              {exifData?.camera || "Camera N/A"} • ISO {exifData?.iso || "--"} •
              {" "}f/{exifData?.aperture || "--"} • {exifData?.shutter || "--"}
            </p>

            <div className="zoom-controls">
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.max(1, prev - 0.5))}
              >
                −
              </button>
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.min(2, prev + 0.5))}
              >
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            className="nav-btn right magnetic ripple"
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation();
              handleRipple(e);
              nextImage();
            }}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

export default Gallery;
