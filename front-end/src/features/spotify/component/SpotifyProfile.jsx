import { useState, useEffect } from "react";
import { getSpotifyProfile } from "../Services/spotifyService";
// import PlaylistCard from './PlaylistCard';
// import SpotifyPlayer from './SpotifyPlayer';
import "../SpotifyProfile.css";
export default function SpotifyProfile({ token }) {
  const [profile, setProfile] = useState(null);
  // const [playlists, setPlaylists] = useState([]);
  // const [likedSongs, setLikedSongs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData] = await Promise.all([getSpotifyProfile()]);

        setProfile(profileData.profile);
      } catch (error) {
        console.error("Error fetching Spotify data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return <div className="loading-spotify">Loading your Spotify data...</div>;
  }

  return (
    <div className="spotify-profile-container">
      <div className="profile-header flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 px-4 sm:px-6 py-6 sm:py-8 bg-gradient-to-b from-[#535353] via-[#121212] to-black rounded-lg shadow-md w-full">
        {/* Profile Image - Center on mobile, left on larger screens */}
        <div className="profile-image flex-shrink-0">
          {profile?.images?.[0]?.url ? (
            <img
              src={profile.images[0].url}
              alt="Profile"
              className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-full border-4 border-[#1db954] shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#282828] flex items-center justify-center text-3xl sm:text-4xl text-white font-bold border-4 border-[#1db954] shadow-lg">
              {profile?.display_name?.charAt(0) || "U"}
            </div>
          )}
        </div>

        {/* Profile Info - Center text on mobile, left align on larger screens */}
        <div className="profile-info text-white text-center sm:text-left w-full">
          <p className="uppercase text-xs font-bold tracking-widest text-[#b3b3b3] mb-1">
            Profile
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight break-words">
            {profile?.display_name || "Spotify User"}
          </h2>
          <p className="text-[#b3b3b3] mt-1 text-sm sm:text-base break-words">
            {profile?.email || ""}
          </p>
          <p className="text-[#b3b3b3] mt-1 text-sm sm:text-base break-words">
            id : {profile?.id || ""}
          </p>

          {/* Extra Info - Stack on mobile, inline on larger screens */}
          <div className="extra-info text-xs sm:text-sm text-[#b3b3b3] mt-3 sm:mt-4 space-y-1 sm:space-y-1">
            <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1">
              <p>Country: {profile?.country || "N/A"}</p>
              <p>
                Plan:{" "}
                {profile?.product
                  ? profile.product.charAt(0).toUpperCase() +
                    profile.product.slice(1)
                  : "N/A"}
              </p>
              <p>
                Followers: {profile?.followers?.total?.toLocaleString() ?? 0}
              </p>
            </div>

            {profile?.external_urls?.spotify && (
              <div className="mt-2 sm:mt-3">
                <a
                  href={profile.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-[#1db954] hover:underline font-medium text-sm sm:text-base"
                >
                  View Profile on Spotify
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* <SpotifyPlayer token={token} /> */}
      {/* 
      <div className="playlists-section">
        <h3>Your Playlists</h3>
        <div className="playlists-grid">
          {playlists.map(playlist => (
            <PlaylistCard 
              key={playlist.id} 
              playlist={playlist} 
              onPlay={() => playTrack(playlist.uri)} 
            />
          ))}
        </div>
      </div> */}

      {/* {likedSongs && likedSongs.length > 0 && (
        <div className="liked-songs-section">
          <h3>Your Liked Songs</h3>
          <div className="songs-list">
            {likedSongs.map((song, index) => (
              <div 
                key={index} 
                className="song-item"
                onClick={() => playTrack(song.uri)}
              >
                <div className="song-info">
                  <img 
                    src={song.album.image || 'https://via.placeholder.com/50'} 
                    alt={song.name} 
                  />
                  <div>
                    <p className="song-name">{song.name}</p>
                    <p className="song-artists">{song.artists.join(', ')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
}
