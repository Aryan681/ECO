import { useEffect, useState } from 'react';

export default function useSpotifyPlayer(token) {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false); // New state for device readiness
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    const loadSpotifySDK = () => {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        const playerInstance = new window.Spotify.Player({
          name: 'Eco Player',
          getOAuthToken: cb => { cb(token); },
          volume: 0.5,
        });

        setPlayer(playerInstance);

        playerInstance.addListener('ready', ({ device_id }) => {
          console.log('Ready with Device ID', device_id);
          setDeviceId(device_id);
          setIsReady(true); // Mark device as ready
          setError(null);
          
          // Transfer playback to this device automatically
          transferPlayback(device_id, token);
        });

        playerInstance.addListener('not_ready', ({ device_id }) => {
          console.log('Device ID has gone offline', device_id);
          setIsReady(false);
        });

        playerInstance.addListener('player_state_changed', state => {
          if (!state) return;
          setCurrentTrack(state.track_window.current_track);
          setIsPlaying(!state.paused);
        });

        playerInstance.addListener('initialization_error', ({ message }) => {
          setError(message);
        });

        playerInstance.addListener('authentication_error', ({ message }) => {
          setError(message);
        });

        playerInstance.addListener('account_error', ({ message }) => {
          setError(message);
        });

        playerInstance.connect().then(success => {
          if (success) {
            console.log('Connected to Spotify player successfully');
          }
        }).catch(err => {
          setError(err.message);
        });
      };
    };

    if (!window.Spotify) {
      loadSpotifySDK();
    } else if (window.onSpotifyWebPlaybackSDKReady) {
      window.onSpotifyWebPlaybackSDKReady();
    }

    return () => {
      if (player) {
        player.disconnect().catch(console.error);
      }
    };
  }, [token]);

  // Helper function to transfer playback to this device
  const transferPlayback = async (deviceId, token) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to transfer playback');
      }
    } catch (err) {
      console.error('Transfer playback error:', err);
    }
  };

  return { player, deviceId, currentTrack, isPlaying, isReady, error };
}