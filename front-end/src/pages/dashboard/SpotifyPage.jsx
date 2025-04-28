import { useState, useEffect } from 'react';
import SpotifyPlayer from '../../features/spotify/component/SpotifyPlayer';
import { getSpotifyProfile } from '../../features/spotify/Services/spotifyService';

function SpotifyPage() {
  const [token, setToken] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setLoading(true);
        const profile = await getSpotifyProfile();
        setToken(profile.accessToken);
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
    return <div className="loading-spotify">Loading Spotify integration...</div>;
  }

  return (
    <div className="spotify-page">
      <h2>Spotify Integration</h2>
      <SpotifyPlayer token={token} />
    </div>
  );
}

export default SpotifyPage;