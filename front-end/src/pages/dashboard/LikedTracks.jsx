import { useEffect, useState } from "react";
import { FiHeart, FiMusic, FiMoreHorizontal, FiPlay } from "react-icons/fi";
import { getLikedSongs } from "../../features/spotify/Services/spotifyService"; // assume this function exists

const LikedTracks = () => {
  const [tracks, setTracks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchLikedTracks = async () => {
      try {
        const data = await getLikedSongs();
        setTracks(data.cleanedTracks || []); // correct key
      } catch (error) {
        console.error("Failed to fetch liked tracks:", error.message);
      }
    };

    fetchLikedTracks();
  }, []);

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-gradient-to-b from-purple-900 via-black to-black text-white min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
        <div className="w-40 h-40 md:w-48 md:h-48 bg-purple-700 shadow-lg flex items-center justify-center text-white">
          <FiHeart className="text-6xl" />
        </div>
        <div className="text-center md:text-left">
          <p className="text-xs uppercase tracking-wider text-gray-300 mb-1">
            Playlist
          </p>
          <h1 className="text-3xl md:text-5xl font-bold mb-2">Liked Songs</h1>
          <p className="text-gray-300 text-sm md:text-base">
            Your liked tracks from Spotify
          </p>
          <div className="flex justify-center md:justify-start items-center mt-2 text-sm gap-1 text-gray-400">
            <span className="font-bold text-white">You</span>
            <span>•</span>
            <span>{tracks.length} songs</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <button
          className="bg-green-500 hover:bg-green-400 text-black rounded-full p-3 shadow-lg transform hover:scale-105 transition"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          <FiPlay className={`text-xl ${isPlaying ? "hidden" : "block"}`} />
        </button>
        <button className="text-white">
          <FiHeart className="text-2xl" />
        </button>
        <button className="text-gray-400 hover:text-white">
          <FiMoreHorizontal className="text-2xl" />
        </button>
      </div>

      {/* Table Header */}
      <div className="hidden sm:grid grid-cols-12 gap-4 text-gray-400 text-sm uppercase tracking-wider border-b border-gray-800 pb-2 px-2">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-5">Title</div>
        <div className="col-span-3">Album</div>
        <div className="col-span-1 text-right">Time</div>
        <div className="col-span-2 hidden md:block">Added</div>
      </div>

      {/* Tracks */}
      <div>
  {tracks.map((track, index) => (
    <div
      key={track.id}
      className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center py-2 sm:py-3 px-2 rounded hover:bg-gray-800 group text-sm"
    >
      {/* Index - hidden on small screens */}
      <div className="hidden sm:block sm:col-span-1 text-center sm:text-left text-gray-400 group-hover:text-white">
        {index + 1}
      </div>

      {/* Track info */}
      <div className="sm:col-span-5 flex items-center gap-3 min-w-0">
        {/* Album Image */}
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

        {/* Song Details - sm:hidden shows inline version, sm:block shows grid version */}
        <div className="w-full min-w-0">
          {/* Inline version for mobile */}
          <div className="flex flex-col sm:hidden">
            <p className="text-white font-medium truncate">{track.name}</p>
            <div className="text-gray-400 text-xs flex justify-between">
              <span className="truncate">{track.artists.join(", ")}</span>
              <span>{formatDuration(track.duration)}</span>
            </div>
          </div>

          {/* Original version for sm+ */}
          <div className="hidden sm:block">
            <p className="text-white font-medium truncate">{track.name}</p>
            <p className="text-gray-400 text-xs truncate">
              {track.artists.join(", ")}
            </p>
          </div>
        </div>
      </div>

      {/* Album Name */}
      <div className="hidden sm:block sm:col-span-3 text-gray-400 group-hover:text-white truncate overflow-hidden whitespace-nowrap">
        {track.album.name}
      </div>

      {/* Duration */}
      <div className="hidden sm:block sm:col-span-1 text-right text-gray-400 group-hover:text-white truncate">
        {formatDuration(track.duration)}
      </div>

      {/* Added Date */}
      <div className="hidden md:block sm:col-span-2 text-gray-500 text-xs truncate overflow-hidden whitespace-nowrap">
        {new Date(track.added_at).toLocaleDateString()}
      </div>
    </div>
  ))}
</div>

    </div>
  );
};

export default LikedTracks;
