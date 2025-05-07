import { 
    pauseTrack, 
    resumeTrack, 
    skipTrack 
  } from '../../Services/spotifyService';
  
  function SpotifyControls({ deviceId, isPlaying }) {
    const handlePlayPause = async () => {
      if (isPlaying) {
        await pauseTrack();
      } else {
        await resumeTrack();
      }
    };
  
    const handleSkip = async () => {
      await skipTrack();
    };
  
    return (
      <div className="spotify-controls">
        <button onClick={handlePlayPause}>
          {isPlaying ? '⏸️ Pause' : '▶️ Play'}
        </button>
        <button onClick={handleSkip}>⏭️ Skip</button>
      </div>
    );
  }
  
  export default SpotifyControls;