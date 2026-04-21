import Navbar from "./components/layout/Navbar";
import MusicPlayer from "./components/ui/MusicPlayer";
import Hero from "./components/sections/Hero";
import Albums from "./components/sections/Albums";
import Contact from "./components/sections/Contact";
import Footer from "./components/layout/Footer";

function App() {
  return (
    <>
      <Navbar />
      <MusicPlayer />
      <Hero />
      <Albums />
      <Contact />
      <Footer />
    </>
  );
}

export default App;