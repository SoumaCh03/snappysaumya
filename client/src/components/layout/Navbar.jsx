function Navbar() {
  return (
    <nav className="navbar">
      <a href="#home" className="nav-logo">
        SnappySaumya
      </a>

      <div className="nav-links">
        <a href="#home">Home</a>
        <a href="#albums">Albums</a>
        <a href="#contact">Contact</a>
      </div>
    </nav>
  );
}

export default Navbar;