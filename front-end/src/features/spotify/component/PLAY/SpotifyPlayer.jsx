"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  playTrack,
  pauseTrack,
  resumeTrack,
  skipTrack,
  getCurrentPlaybackState,

} from "../../Services/spotifyService";
import useSpotifyPlayer from "../../hooks/useSpotifyPlayer"; // <- Your custom hook path
import { debounce } from "lodash";

const SpotifyController = ({ currentTrackUri }) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("spotifyAccessToken") : null;
  const { player, deviceId, currentTrack, isPlaying, isReady, error } = useSpotifyPlayer(token);

  const [playerState, setPlayerState] = useState({
    position: 0,
    duration: 0,
    paused: true,
    track: null,
    shuffle: false,
    repeat_mode: 0,
  });

  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [dragProgressValue, setDragProgressValue] = useState(0);
  const progressBarRef = useRef(null);

  // Update player state from SDK when available
  useEffect(() => {
    const fetchInitialState = async () => {
      if (token && isReady) {
        const playbackState = await getCurrentPlaybackState(token);
        if (playbackState) {
          updatePlayerState(playbackState);
        }
      }
    };
    fetchInitialState();
  }, [token, isReady]);

  const updatePlayerState = (state) => {
    setPlayerState({
      position: state.position,
      duration: state.duration,
      paused: state.paused,
      track: state.track_window.current_track,
      shuffle: state.shuffle,
      repeat_mode: state.repeat_mode,
    });
  };

  const handlePlay = useCallback(async () => {
    if (!player || !deviceId || !currentTrackUri || !token) return;
    await playTrack(currentTrackUri, deviceId, token);
  }, [player, deviceId, currentTrackUri, token]);

  const handlePlayPause = useCallback(async () => {
    if (!player || !token) return;
    isPlaying ? await pauseTrack(token) : await resumeTrack(token);
  }, [player, token, isPlaying]);

  const handleSkip = useCallback(async (direction) => {
    if (!player || !token) return;
    await skipTrack(direction, token);
  }, [player, token]);

  const handleProgressClick = (e) => {
    if (!progressBarRef.current || !player || !token) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newPos = percent * playerState.duration;

    fetch("https://api.spotify.com/v1/me/player/seek", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ position_ms: Math.floor(newPos) }),
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



  const formatTime = (ms) => {
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${min}:${rem < 10 ? "0" : ""}${rem}`;
  };

  if (!token || !isReady || !currentTrack) return null;

  const currentProgress = isDraggingProgress ? dragProgressValue : playerState.position;
  const progressPercent = playerState.duration ? (currentProgress / playerState.duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-black text-white border-t border-gray-800 flex items-center justify-between px-4 z-50">
      <div className="flex items-center gap-4 w-1/4 min-w-[180px]">
        {currentTrack && (
          <>
            <img src={currentTrack.album.images[0].url} alt="Album" className="h-14 w-14 object-cover rounded-md" />
            <div className="truncate">
              <p className="text-sm font-semibold truncate">{currentTrack.name}</p>
              <p className="text-xs text-gray-400 truncate">
                {currentTrack.artists.map((a) => a.name).join(", ")}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col items-center justify-center w-2/4 max-w-[500px]">
        <div className="flex items-center justify-center gap-5 mb-1">
          <button onClick={() => handleSkip("previous")} className="text-sm">⏮️</button>
          <button
            onClick={handlePlayPause}
            className="bg-white text-black w-10 h-10 rounded-full flex items-center justify-center text-lg"
          >
            {isPlaying ? "⏸️" : "▶️"}
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
            <div
              className="absolute top-0 left-0 h-1 bg-green-500 rounded"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs text-gray-300">{formatTime(playerState.duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default SpotifyController;
