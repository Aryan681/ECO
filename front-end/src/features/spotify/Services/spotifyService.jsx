import axios from "axios";
const API_BASE = "http://localhost:3000/api/spotify";

// Create axios instance with base configuration
const spotifyApi = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add Authorization header dynamically for each request
spotifyApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Get the token from localStorage
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`; // Add the token to Authorization header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
spotifyApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration or invalid token
      localStorage.removeItem("token");
      window.location.href = "/auth/login";
      console.log(error);
    }
    return Promise.reject(error);
  }
);

export const initiateSpotifyLogin = async () => {
  try {
    // Send GET request to backend API using the spotifyApi instance
    const response = await spotifyApi.get("/login");

    if (response.data.url) {
      console.log("Redirecting to Spotify login URL:", response.data.url);
      window.location.href = response.data.url; // Redirect to the Spotify login URL
    } else {
      console.error("No URL returned from backend.");
      alert("Failed to initiate Spotify login.");
    }
  } catch (error) {
    console.error("Error initiating Spotify login:", error);
    alert("Failed to initiate Spotify login.");
  }
};

export const refreshAccessToken = async (refreshToken) => {
  const response = await fetch("http://localhost:3000/api/spotify/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) throw new Error("Failed to refresh token");

  const data = await response.json();
  localStorage.setItem("spotifyAccessToken", data.accessToken);
  return data.accessToken;
};


export const getSpotifyProfile = async () => {
  try {
    const response = await spotifyApi.get("/profile");
    return response.data;
  } catch (error) {
    console.error("Error getting Spotify profile:", error);
    throw error;
  }
};

export const getUserPlaylists = async () => {
  try {
    const response = await spotifyApi.get("/playlists");
    return response.data.playlists;
  } catch (error) {
    console.error("Error getting user playlists:", error);
    throw error;
  }
};
 
export const getLikedSongs = async (limit = 50, offset = 0) => {
  try {
    const response = await spotifyApi.get("/liked", {
      params: { limit, offset },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting liked songs:", error);
    throw error;
  }
};

export const getPlaylistTracks = async (playlistId) => {
  try {
    const response = await spotifyApi.get(`/playlists/${playlistId}/tracks`);
    return response.data.tracks; // backend returns { success, tracks }
  } catch (error) {
    console.error("❌ Error getting playlist tracks:", error);

    if (error.response?.status === 401) {
      throw new Error("Spotify session expired. Please reconnect.");
    }

    throw new Error(
      error.response?.data?.message || "Failed to fetch playlist tracks"
    );
  }
};


export const getCurrentPlaybackState = async () => {
  const response = await fetch("http://localhost:5000/api/spotify/player", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // again if using cookies/session
  });

  if (!response.ok) {
    throw new Error("Failed to get playback state");
  }

  return response.json();
};


export const playTrack = async (trackUri, deviceId) => {
  try {
    await spotifyApi.post("/play", { trackUri, deviceId });
  } catch (error) {
    console.error("Error playing track:", error);
    throw error;
  }
};

export const pauseTrack = async () => {
  try {
    await spotifyApi.put("/pause");
  } catch (error) {
    console.error("Error pausing track:", error);
    throw error;
  }
};

export const resumeTrack = async () => {
  try {
    await spotifyApi.put("/resume");
  } catch (error) {
    console.error("Error resuming track:", error);
    throw error;
  }
};

export const skipTrack = async (direction = "next") => {
  try {
    await spotifyApi.post("/track", { action: direction });
  } catch (error) {
    console.error("Error skipping track:", error);
    throw error;
  }
};





