// src/features/spotify/components/SpotifyLoginButton.jsx
import { useState } from 'react';
import { initiateSpotifyLogin } from '../Services/spotifyService';

function SpotifyLoginButton() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const authUrl = await initiateSpotifyLogin();
      // Redirect to Spotify auth page
      window.location.href = authUrl;
    } catch (error) {
      console.error('Login failed:', error);
      alert('Failed to initiate Spotify login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleLogin}
      disabled={loading}
      className="spotify-login-button"
    >
      {loading ? 'Connecting...' : 'Connect with Spotify'}
    </button>
  );
}

export default SpotifyLoginButton;