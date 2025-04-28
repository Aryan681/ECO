import { useEffect, useState } from 'react';

export default function useSpotifyPlayer(token) {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
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
          setError(null);
        });

        playerInstance.addListener('not_ready', ({ device_id }) => {
          console.log('Device ID has gone offline', device_id);
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

        playerInstance.connect().catch(err => {
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

  return { player, deviceId, currentTrack, isPlaying, error };
}