import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getSpotifyProfile } from "../../features/spotify/Services/spotifyService";
import ConnectSpotify from "../../features/spotify/component/ConnectSpotify";
import SpotifyProfile from "../../features/spotify/component/SpotifyProfile";
import "../../features/spotify/Spotify.css";

function SpotifyPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // ✅ Step 1: Handle token from query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("spotifyAccessToken", token);
      localStorage.setItem("spotify_connected", "true");

      // Clean up the URL
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location]);

  // ✅ Step 2: Check connection and try profile
  useEffect(() => {
    const checkConnection = async () => {
      const wasConnected = localStorage.getItem("spotify_connected");
      if (wasConnected === "true") {
        setIsConnected(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        await getSpotifyProfile(); // Uses stored token
        setIsConnected(true);
        localStorage.setItem("spotify_connected", "true");
      } catch (error) {
        console.log("Not connected to Spotify:", error);
        setIsConnected(false);
        localStorage.setItem("spotify_connected", "false");
      } finally {
        setLoading(false);
      }
    };

    checkConnection();
  }, []);

  // ✅ Step 3: Initialize Spotify Web Playback SDK
  useEffect(() => {
    const token = localStorage.getItem("spotifyAccessToken");
    if (!token) return;
  
    // ✅ Define the function early
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "Eco Web Player",
        getOAuthToken: cb => cb(token),
        volume: 0.3,
      });
  
      player.addListener("initialization_error", ({ message }) => console.error(message));
      player.addListener("authentication_error", ({ message }) => console.error(message));
      player.addListener("account_error", ({ message }) => console.error(message));
      player.addListener("playback_error", ({ message }) => console.error(message));
  
      player.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
        localStorage.setItem("spotifyDeviceId", device_id);
  
        fetch("https://api.spotify.com/v1/me/player", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            device_ids: [device_id],
            play: false,
          }),
        })
          .then(res => {
            if (!res.ok) throw new Error("Failed to transfer playback");
            console.log("✅ Device Activated!");
          })
          .catch(err => {
            console.error("❌ Error activating device:", err);
          });
      });
  
      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });
  
      player.connect();
    };
  
    // ✅ Then inject the script
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);
  
    // Optional cleanup (if the component unmounts)
    return () => {
      window.onSpotifyWebPlaybackSDKReady = null;
    };
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
