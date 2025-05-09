import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPlaylistTracks, getUserPlaylists, playTrack } from "../../features/spotify/Services/spotifyService";
import { FiMusic } from "react-icons/fi";
import SpotifyController from "../../features/spotify/component/PLAY/SpotifyPlayer";

const PlaylistDetails = () => {
  const { playlistId } = useParams();
  const [tracks, setTracks] = useState([]);
  const [playlist, setPlaylist] = useState(null);
  const [currentTrackUri, setCurrentTrackUri] = useState(null);
  const [deviceId, setDeviceId] = useState(null); // Optional: if you manage deviceId separately
  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  useEffect(() => {
    const fetchPlaylistData = async () => {
      try {
        const playlistData = await getUserPlaylists();
        const currentPlaylist = playlistData.find(pl => pl.id === playlistId);
        setPlaylist(currentPlaylist);

        const data = await getPlaylistTracks(playlistId);
        setTracks(data);
      } catch (error) {
        console.error("Failed to fetch playlist data:", error.message);
      }
    };

    fetchPlaylistData();
  }, [playlistId]);

  const handleTrackClick = async (trackUri) => {
    try {
      await playTrack(trackUri, deviceId);
      setCurrentTrackUri(trackUri);
    } catch (error) {
      console.error("Failed to play track:", error);
    }
  };

  if (!playlist) return <div>Loading...</div>;

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black text-white min-h-screen p-4 md:p-8">
      {/* ... playlist header ... */}

      <div className="hidden sm:grid grid-cols-12 gap-4 text-gray-400 text-sm uppercase tracking-wider border-b border-gray-800 pb-2 px-2">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-5">Title</div>
        <div className="col-span-3">Album</div>
        <div className="col-span-1 text-right">Time</div>
      </div>

      <div>
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center py-3 px-2 rounded hover:bg-gray-800 group text-sm cursor-pointer"
            onClick={() => handleTrackClick(track.uri)}
          >
            <div className="sm:col-span-1 text-center text-gray-400 group-hover:text-white">
              {index + 1}
            </div>

            <div className="sm:col-span-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-700 flex-shrink-0">
                {track.album.image ? (
                  <img
                    src={track.album.image}
                    alt={track.album.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FiMusic />
                  </div>
                )}
              </div>
              <div>
                <p className="text-white font-medium truncate">{track.name}</p>
                <p className="text-gray-400 text-xs truncate">{track.artists.join(", ")}</p>
              </div>
            </div>

            <div className="sm:col-span-3 text-gray-400 group-hover:text-white truncate">
              {track.album.name}
            </div>

            <div className="sm:col-span-1 text-right text-gray-400">
              {formatDuration(track.duration_ms)}
            </div>
          </div>
        ))}
      </div>

      {/* 👇 Spotify controller shows when a track is selected */}
      {currentTrackUri && (
        <div className="fixed bottom-0 left-0 w-full z-50">
          <SpotifyController trackUri={currentTrackUri} deviceId={deviceId} />
        </div>
      )}
    </div>
  );
};

export default PlaylistDetails;
