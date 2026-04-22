function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        {/* LEFT */}
        <div className="footer-left">
          <h3>Connect With Me</h3>

          <div className="social-row">
            <a href="https://github.com/" className="social-icon">G</a>
            <a href="https://facebook.com/" className="social-icon">f</a>
            <a href="https://instagram.com/" className="social-icon">ig</a>
            <a href="https://linkedin.com/" className="social-icon">in</a>
            <a href="https://x.com/" className="social-icon">X</a>
            <a href="https://fotor.com/" className="social-icon">F</a>
            <a href="https://pixlr.com/" className="social-icon">P</a>
          </div>

          {/* 🔥 ADMIN LINK (FIXED POSITION) */}
          <div style={{ marginTop: "20px" }}>
            <a
              href="/admin/login"
              style={{
                fontSize: "13px",
                textDecoration: "none",
                color: "#22c55e",
                opacity: 0.7,
                letterSpacing: "0.5px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = "1";
                e.target.style.textShadow = "0 0 8px rgba(34,197,94,0.7)";
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = "0.7";
                e.target.style.textShadow = "none";
              }}
            >
              ⚙ Admin Access
            </a>
          </div>
        </div>

        {/* RIGHT */}
        <div className="footer-right">
          <h3>Location</h3>

          <div className="map-box">
            <iframe
              title="location"
              src="https://www.google.com/maps?q=Cooch+Behar+West+Bengal&output=embed"
              width="100%"
              height="220"
              style={{ border: 0 }}
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <p className="copyright">
          © 2026 SnappySaumya by Saumyadeep
        </p>

        <p className="best-view">
          Best viewed on modern desktop & mobile browsers
          (i.e.; Chrome, Edge, Firefox, Safari) at 1920p × 1080p and above.
        </p>
      </div>
    </footer>
  );
}

export default Footer;