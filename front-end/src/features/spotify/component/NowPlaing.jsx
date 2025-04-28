import { likeTrack, unlikeTrack } from '../Services/spotifyService';

function NowPlaying({ track, isPlaying }) {
  if (!track) return <div className="now-playing">No track playing</div>;

  const handleLike = async () => {
    try {
      await likeTrack(track.id);
      alert('Added to liked songs!');
    } catch (error) {
      console.error('Error liking track:', error);
    }
  };

  const handleUnlike = async () => {
    try {
      await unlikeTrack(track.id);
      alert('Removed from liked songs!');
    } catch (error) {
      console.error('Error unliking track:', error);
    }
  };

  return (
    <div className="now-playing">
      <div className="track-info">
        <img 
          src={track.album.images[0]?.url} 
          alt={track.name} 
          className="album-art"
        />
        <div className="track-details">
          <h4>{track.name}</h4>
          <p>{track.artists.map(a => a.name).join(', ')}</p>
          <p>{track.album.name}</p>
        </div>
      </div>
      <div className="track-actions">
        <button onClick={handleLike}>❤️ Like</button>
        <button onClick={handleUnlike}>💔 Unlike</button>
      </div>
    </div>
  );
}

export default NowPlaying;