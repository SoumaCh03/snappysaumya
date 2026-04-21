import { useState } from "react";
import { Menu, X } from "lucide-react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleClose = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      
      {/* Logo */}
      <a href="#home" className="nav-logo" onClick={handleClose}>
        SnappySaumya
      </a>

      {/* Desktop Links */}
      <div className="nav-links desktop-menu">
        <a href="#home">Home</a>
        <a href="#albums">Albums</a>
        <a href="#contact">Contact</a>
      </div>

      {/* Hamburger Icon */}
      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <X size={28} /> : <Menu size={28} />}
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? "active" : ""}`}>
        <a href="#home" onClick={handleClose}>Home</a>
        <a href="#albums" onClick={handleClose}>Albums</a>
        <a href="#contact" onClick={handleClose}>Contact</a>
      </div>
      
    </nav>
  );
}

export default Navbar;