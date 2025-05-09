"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  playTrack,
  pauseTrack,
  resumeTrack,
  skipTrack,
  setVolume,
  getCurrentPlaybackState,

} from "../../Services/spotifyService";
import { debounce } from "lodash";

const SpotifyController = ({ currentTrackUri }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [playerState, setPlayerState] = useState({
    position: 0,
    duration: 0,
    paused: true,
    track: null,
    shuffle: false,
    repeat_mode: 0,
  });
  const [volume, setVolumeState] = useState(50);
  const [isActive, setIsActive] = useState(false);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [dragProgressValue, setDragProgressValue] = useState(0);
  const progressBarRef = useRef(null);
  const isInitialized = useRef(false);

  const cleanup = useCallback(() => {
    if (player) player.disconnect();
  }, [player]);

  useEffect(() => {
    const token = localStorage.getItem("spotifyAccessToken");
    if (!token || isInitialized.current) return;

    setAccessToken(token);
    setIsActive(true);

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new Spotify.Player({
        name: "Spotify Web Player Clone",
        getOAuthToken: (cb) => cb(token),
        volume: volume / 100,
      });

      player.addListener("ready", async ({ device_id }) => {
        setDeviceId(device_id);

        await fetch("https://api.spotify.com/v1/me/player", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ device_ids: [device_id], play: false }),
        });

        const playbackState = await getCurrentPlaybackState(token);
        if (playbackState) updatePlayerState(playbackState);
      });

      player.addListener("player_state_changed", (state) => {
        if (!state) return setIsActive(false);
        updatePlayerState(state);
      });

      ["initialization_error", "authentication_error", "playback_error", "account_error"].forEach(
        (err) => player.addListener(err, ({ message }) => console.error(`${err}:`, message))
      );

      player.connect().catch(console.error);

      setPlayer(player);
      isInitialized.current = true;
    };

    return () => {
      cleanup();
      document.body.removeChild(script);
    };
  }, [cleanup, volume]);

  const updatePlayerState = (state) => {
    setPlayerState({
      position: state.position,
      duration: state.duration,
      paused: state.paused,
      track: state.track_window.current_track,
      shuffle: state.shuffle,
      repeat_mode: state.repeat_mode,
    });
    setIsActive(true);
  };

  const handlePlay = useCallback(async () => {
    if (!player || !deviceId || !currentTrackUri || !accessToken) return;
    await playTrack(currentTrackUri, deviceId, accessToken);
  }, [player, deviceId, currentTrackUri, accessToken]);

  const handlePlayPause = useCallback(async () => {
    if (!player || !accessToken) return;
    playerState.paused ? await resumeTrack(accessToken) : await pauseTrack(accessToken);
  }, [player, accessToken, playerState.paused]);

  const handleSkip = useCallback(async (direction) => {
    if (!player || !accessToken) return;
    await skipTrack(direction, accessToken);
  }, [player, accessToken]);

  const handleVolumeChange = useCallback(
    debounce(async (vol) => {
      if (!player || !accessToken) return;
      await setVolume(vol, accessToken);
    }, 300),
    [player, accessToken]
  );

  const onVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolumeState(newVolume);
    handleVolumeChange(newVolume);
  };

  const handleProgressClick = (e) => {
    if (!progressBarRef.current || !player || !accessToken) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newPos = percent * playerState.duration;

    fetch("https://api.spotify.com/v1/me/player/seek", {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { position_ms: Math.floor(newPos).toString() },
    });

    setPlayerState((prev) => ({ ...prev, position: newPos }));
  };

  const handleProgressDragStart = () => setIsDraggingProgress(true);
  const handleProgressDragEnd = () => setIsDraggingProgress(false);
  const handleProgressDrag = (e) => {
    if (!isDraggingProgress || !progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    setDragProgressValue(percent * playerState.duration);
  };

  const handleShuffle = useCallback(async () => {
    if (!accessToken) return;
    await toggleShuffle(!playerState.shuffle, accessToken);
    setPlayerState((prev) => ({ ...prev, shuffle: !prev.shuffle }));
  }, [accessToken, playerState.shuffle]);

  const handleRepeat = useCallback(async () => {
    if (!accessToken) return;
    const nextMode = ((playerState.repeat_mode + 1) % 3);
    await toggleRepeat(nextMode, accessToken);
    setPlayerState((prev) => ({ ...prev, repeat_mode: nextMode }));
  }, [accessToken, playerState.repeat_mode]);

  const formatTime = (ms) => {
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${min}:${rem < 10 ? "0" : ""}${rem}`;
  };

  if (!accessToken || !isActive) return null;

  const currentProgress = isDraggingProgress ? dragProgressValue : playerState.position;
  const progressPercent = playerState.duration ? (currentProgress / playerState.duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-black text-white border-t border-gray-800 flex items-center justify-between px-4 z-50">
      
      {/* Left - Track Info */}
      <div className="flex items-center gap-4 w-1/4 min-w-[180px]">
        {playerState.track && (
          <>
            <img src={playerState.track.album.images[0].url} alt="Album" className="h-14 w-14 object-cover rounded-md" />
            <div className="truncate">
              <p className="text-sm font-semibold truncate">{playerState.track.name}</p>
              <p className="text-xs text-gray-400 truncate">
                {playerState.track.artists.map(a => a.name).join(", ")}
              </p>
            </div>
          </>
        )}
      </div>
  
      {/* Center - Controls */}
      <div className="flex flex-col items-center justify-center w-2/4 max-w-[500px]">
        <div className="flex items-center justify-center gap-5 mb-1">
  
          <button onClick={() => handleSkip("previous")} className="text-sm">⏮️</button>
          <button
            onClick={handlePlayPause}
            className="bg-white text-black w-10 h-10 rounded-full flex items-center justify-center text-lg"
          >
            {playerState.paused ? "▶️" : "⏸️"}
          </button>
          <button onClick={() => handleSkip("next")} className="text-sm">⏭️</button>
         
        </div>
  
        <div className="flex items-center w-full gap-2">
          <span className="text-xs text-gray-300">{formatTime(currentProgress)}</span>
          <div
            ref={progressBarRef}
            onClick={handleProgressClick}
            onMouseDown={handleProgressDragStart}
            onMouseUp={handleProgressDragEnd}
            onMouseMove={handleProgressDrag}
            className="flex-1 h-1 bg-gray-700 rounded cursor-pointer relative"
          >
            <div className="absolute top-0 left-0 h-1 bg-green-500 rounded" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <span className="text-xs text-gray-300">{formatTime(playerState.duration)}</span>
        </div>
      </div>
  
      {/* Right - Volume & Placeholder Icons */}
      <div className="flex items-center gap-4 w-1/4 justify-end pr-2">
 
  
        {/* Volume Slider */}
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={onVolumeChange}
          className="w-24 accent-green-500"
        />
      </div>
    </div>
  );
  
};

export default SpotifyController;
