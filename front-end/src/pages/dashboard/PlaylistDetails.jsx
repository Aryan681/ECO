import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPlaylistTracks ,getUserPlaylists} from "../../features/spotify/Services/spotifyService";
import { FiMusic } from "react-icons/fi";

const PlaylistDetails = () => {
  const { playlistId } = useParams();
  const [tracks, setTracks] = useState([]);
  const [playlist, setPlaylist] = useState(null);

  useEffect(() => {
    const fetchPlaylistData = async () => {
      try {
      
        const playlistData = await getUserPlaylists(); 
        const currentPlaylist = playlistData.find(pl => pl.id === playlistId);
        setPlaylist(currentPlaylist);

        // Fetch tracks for the selected playlist
        const data = await getPlaylistTracks(playlistId);
        setTracks(data);
      } catch (error) {
        console.error("Failed to fetch playlist data:", error.message);
      }
    };

    fetchPlaylistData();
  }, [playlistId]);

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!playlist) return <div>Loading...</div>;

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black text-white min-h-screen p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
        <div className="w-40 h-40 md:w-48 md:h-48 bg-gray-800 shadow-lg flex items-center justify-center text-gray-400">
          {playlist.images && playlist.images.length > 0 ? (
            <img
              src={playlist.images[0].url}
              alt={playlist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <FiMusic className="text-5xl md:text-6xl" />
          )}
        </div>
        <div className="text-center md:text-left">
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Playlist</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-2">{playlist.name}</h1>
          <p className="text-gray-400 text-sm md:text-base">Your collection of favorite tracks</p>
          <div className="flex justify-center md:justify-start items-center mt-2 text-sm gap-1 text-gray-400">
            <span className="font-bold text-white">Spotify</span>
            <span>•</span>
            <span>{tracks.length} songs</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <button className="bg-green-500 hover:bg-green-400 text-black rounded-full p-3 shadow-lg transform hover:scale-105 transition">
          <FiMusic className="text-xl" />
        </button>
      </div>

      {/* Table Header */}
      <div className="hidden sm:grid grid-cols-12 gap-4 text-gray-400 text-sm uppercase tracking-wider border-b border-gray-800 pb-2 px-2">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-5">Title</div>
        <div className="col-span-3">Album</div>
        <div className="col-span-1 text-right">Time</div>
      </div>

      {/* Tracks List */}
      <div>
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center py-3 px-2 rounded hover:bg-gray-800 group text-sm"
          >
            <div className="sm:col-span-1 text-center sm:text-left text-gray-400 group-hover:text-white">
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

            <div className="sm:col-span-1 text-right text-gray-400 group-hover:text-white">
              {formatDuration(track.duration)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistDetails;
