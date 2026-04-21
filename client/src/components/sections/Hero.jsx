import { useEffect, useRef } from "react";

function Hero() {
  const svgRef = useRef(null);

  useEffect(() => {
    const paths = svgRef.current.querySelectorAll("path");

    paths.forEach((path, i) => {
      const length = path.getTotalLength();

      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;

      const animate = () => {
        path.style.transition = "none";
        path.style.strokeDashoffset = length;

        setTimeout(() => {
          path.style.transition = "stroke-dashoffset 4s ease-in-out";
          path.style.strokeDashoffset = "0";
        }, 50);
      };

      animate();
      setInterval(animate, 5000 + i * 500); // continuous redraw
    });
  }, []);

  const scrollToAlbums = () => {
    const section = document.getElementById("albums");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="hero-section">
      <div className="hero-overlay"></div>

      <div className="floating-orb orb-1"></div>
      <div className="floating-orb orb-2"></div>
      <div className="floating-orb orb-3"></div>

      {/* 🔥 Mandala SVG */}
      <svg
        ref={svgRef}
        viewBox="0 0 800 800"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          zIndex: 0,
          opacity: 0.18,
        }}
      >
        {/* Circular mandala paths */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x = 400 + 200 * Math.cos(angle);
          const y = 400 + 200 * Math.sin(angle);

          return (
            <path
              key={i}
              d={`M400 400 Q${x} ${y} ${400 + 250 * Math.cos(angle)} ${
                400 + 250 * Math.sin(angle)
              }`}
              stroke="cyan"
              strokeWidth="1.2"
              fill="none"
            />
          );
        })}

        {/* inner pattern */}
        {[...Array(8)].map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const x = 400 + 120 * Math.cos(angle);
          const y = 400 + 120 * Math.sin(angle);

          return (
            <path
              key={`inner-${i}`}
              d={`M400 400 Q${x} ${y} ${400 + 160 * Math.cos(angle)} ${
                400 + 160 * Math.sin(angle)
              }`}
              stroke="cyan"
              strokeWidth="0.8"
              fill="none"
            />
          );
        })}
      </svg>

      {/* CONTENT */}
      <p className="hero-subtitle">
        PHOTOGRAPHY • VISUAL STORIES • MEMORIES
      </p>

      <h1 className="hero-title">SnappySaumya</h1>

      <p className="hero-text">
        A curated gallery of landscapes, journeys, portraits,
        and moments captured through my lens.
      </p>

      <button className="hero-button" onClick={scrollToAlbums}>
        Explore Albums
      </button>
    </section>
  );
}

export default Hero;