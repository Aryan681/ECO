import { useState, useEffect } from 'react';
import { getSpotifyProfile } from '../../features/spotify/Services/spotifyService';
import ConnectSpotify from '../../features/spotify/component/ConnectSpotify';
import SpotifyProfile from '../../features/spotify/component/SpotifyProfile';
import '../../features/spotify/Spotify.css'; // We'll create this next

function SpotifyPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setLoading(true);
        await getSpotifyProfile();
        setIsConnected(true);
      } catch (error) {
        console.log('Not connected to Spotify:', error);
        setIsConnected(false);
      } finally {
        setLoading(false);
      }
    };

    checkConnection();
  }, []);

  if (loading) {
    return (
      <div className="spotify-loading-screen">
        <div className="spotify-loading-spinner"></div>
        <p>Loading Spotify integration...</p>
      </div>
    );
  }

  return (
    <div className="spotify-page">
      {isConnected ? (
        <SpotifyProfile />
      ) : (
        <ConnectSpotify onConnect={() => setIsConnected(true)} />
      )}
    </div>
  );
}

export default SpotifyPage;