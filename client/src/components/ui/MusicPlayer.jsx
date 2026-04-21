import { useRef, useState } from "react";
import backgroundMusic from "../../assets/audio.mp3"; // ✅ FIXED PATH

export default function MusicPlayer() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  return (
    <>
      <audio ref={audioRef} loop>
        <source src={backgroundMusic} type="audio/mpeg" />
      </audio>

      <button onClick={toggleMusic} className="music-toggle">
        {isPlaying ? "🔊" : "🔈"}
      </button>
    </>
  );
}