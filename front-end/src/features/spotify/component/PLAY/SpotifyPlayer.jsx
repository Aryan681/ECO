import { useState, useEffect } from 'react';

export default function SpotifyPlayer({ token }) {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
// Add this to your SpotifyPlayer component
const transferPlayback = async () => {
  if (!deviceId) return;
  
  await fetch(`https://api.spotify.com/v1/me/player`, {
    method: 'PUT',
    body: JSON.stringify({ device_ids: [deviceId], play: false }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
};

// Call this when device becomes ready
player.addListener('ready', ({ device_id }) => {
  setDeviceId(device_id);
  transferPlayback();
});
  useEffect(() => {
    if (!token) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Your App Name',
        getOAuthToken: cb => { cb(token); },
        volume: 0.5
      });

      setPlayer(player);

      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
      });

      player.addListener('player_state_changed', state => {
        if (!state) return;
        setIsPlaying(!state.paused);
        setCurrentTrack(state.track_window.current_track);
      });

      player.connect().then(success => {
        if (success) {
          console.log('The Web Playback SDK successfully connected!');
        }
      });

      return () => {
        player.disconnect();
      };
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [token]);

  const playTrack = (trackUri) => {
    if (!deviceId) return;
    
    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      body: JSON.stringify({ uris: [trackUri] }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  };

  const togglePlay = () => {
    if (!deviceId) return;
    
    fetch(`https://api.spotify.com/v1/me/player/${isPlaying ? 'pause' : 'play'}?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  };

  return (
    <div className="spotify-player-container">
      {currentTrack && (
        <div className="now-playing">
          <img 
            src={currentTrack.album.images[0].url} 
            alt={currentTrack.name} 
            className="now-playing-cover"
          />
          <div className="now-playing-info">
            <div className="now-playing-name">{currentTrack.name}</div>
            <div className="now-playing-artist">
              {currentTrack.artists.map(artist => artist.name).join(', ')}
            </div>
          </div>
        </div>
      )}
      
      <div className="player-controls">
        <button onClick={togglePlay} className="play-button">
          {isPlaying ? '❚❚' : '▶'}
        </button>
      </div>
    </div>
  );
}