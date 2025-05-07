import { useNavigate } from "react-router-dom";
import { FiHeart } from "react-icons/fi";

export default function LikedSongsCard({ likedPlaylist }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/dashboard/liked`);
  };

  return (
    <div className="playlist-card" onClick={handleClick}>
      <div className="playlist-image">
        {likedPlaylist.images?.[0]?.url ? (
          <img src={likedPlaylist.images[0].url} alt={likedPlaylist.name} />
        ) : (
          <div className="playlist-image-placeholder">
            <FiHeart className="text-4xl text-pink-500" />
          </div>
        )}
      </div>
      <div className="playlist-info">
        <h4>{likedPlaylist.name}</h4> 
        <p>{likedPlaylist.tracks.total} liked songs</p>
      </div>
    </div>
  );
}
