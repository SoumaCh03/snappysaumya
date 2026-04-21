function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
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
        </div>

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

      <p className="copyright">
        © 2026 SnappySaumya by Saumyadeep
      </p>

      <p className="best-view">
        Best viewed on modern desktop & mobile browsers 
        (i.e.; Chrome, Edge, Firefox, Safari) at 1920p × 1080p and above.
      </p>
    </footer>
  );
}

export default Footer;