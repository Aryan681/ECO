import { useNavigate } from "react-router-dom";

export default function PlaylistCard({ playlist, onPlay }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/dashboard/playlist/${playlist.id}`);

  }; 

    return (
      <div className="playlist-card"  onClick={handleClick}>
        <div className="playlist-image">
          {playlist.coverImage ? (
            <img src={playlist.coverImage} alt={playlist.name} />
          ) : (
            <div className="playlist-image-placeholder">
              <span>🎵</span>
            </div>
          )}
        </div>
        <div className="playlist-info">
          <h4>{playlist.name}</h4>
          <p>{playlist.totalTracks} tracks • By {playlist.owner}</p>
        </div>
      </div>
    );
  }