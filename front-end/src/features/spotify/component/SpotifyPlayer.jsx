import useSpotifyPlayer from '../hooks/useSpotifyPlayer';
import SpotifyControls from './SpotifyControls';
import TrackSelector from './TrackSelector';
import NowPlaying from './NowPlaing';

function SpotifyPlayer({ token }) {
  const { deviceId, currentTrack, isPlaying, error } = useSpotifyPlayer(token);

  if (error) {
    return (
      <div className="spotify-error">
        <h3>Spotify Player Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="spotify-login-prompt">
        <h3>Connect to Spotify</h3>
        <SpotifyLoginButton />
      </div>
    );
  }

  return (
    <div className="spotify-player-container">
      <NowPlaying track={currentTrack} isPlaying={isPlaying} />
      <SpotifyControls deviceId={deviceId} isPlaying={isPlaying} />
      {deviceId && <TrackSelector deviceId={deviceId} />}
    </div>
  );
}

export default SpotifyPlayer;