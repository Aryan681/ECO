import { useState, useEffect } from 'react';
import { 
  getUserPlaylists, 
  getLikedSongs,
  playTrack,
  addToPlaylist,
  removeFromPlaylist
} from '../../Services/spotifyService';

function TrackSelector({ deviceId }) {
  const [playlists, setPlaylists] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [playlistsData, likedData] = await Promise.all([
          getUserPlaylists(),
          getLikedSongs()
        ]);
        setPlaylists(playlistsData);
        setLikedSongs(likedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePlayTrack = async (trackUri) => {
    if (!deviceId) {
      alert('Player not ready yet');
      return;
    }
    await playTrack(trackUri, deviceId);
  };

  const handleAddToPlaylist = async (playlistId, trackUri) => {
    await addToPlaylist(playlistId, trackUri.split(':')[2]);
    alert('Added to playlist!');
  };

  const handleRemoveFromPlaylist = async (playlistId, trackUri) => {
    await removeFromPlaylist(playlistId, trackUri.split(':')[2]);
    alert('Removed from playlist!');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="track-selector">
      <div className="library-section">
        <h3>Your Library</h3>
        <div className="liked-songs">
          <h4>Liked Songs</h4>
          <ul>
            {likedSongs.map(track => (
              <li key={track.uri}>
                <button onClick={() => handlePlayTrack(track.uri)}>
                  {track.name} - {track.artists.join(', ')}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="playlists-section">
        <h3>Your Playlists</h3>
        <select 
          onChange={(e) => setSelectedPlaylist(playlists.find(p => p.id === e.target.value))}
          value={selectedPlaylist?.id || ''}
        >
          <option value="">Select a playlist</option>
          {playlists.map(playlist => (
            <option key={playlist.id} value={playlist.id}>
              {playlist.name} ({playlist.tracks.length} tracks)
            </option>
          ))}
        </select>

        {selectedPlaylist && (
          <div className="playlist-tracks">
            <h4>{selectedPlaylist.name}</h4>
            <ul>
              {selectedPlaylist.tracks.map(track => (
                <li key={track.uri}>
                  <div className="track-item">
                    <button onClick={() => handlePlayTrack(track.uri)}>
                      {track.name} - {track.artists.join(', ')}
                    </button>
                    <div className="track-actions">
                      <button 
                        onClick={() => handleAddToPlaylist(selectedPlaylist.id, track.uri)}
                        title="Add to playlist"
                      >
                        ➕
                      </button>
                      <button 
                        onClick={() => handleRemoveFromPlaylist(selectedPlaylist.id, track.uri)}
                        title="Remove from playlist"
                      >
                        ➖
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrackSelector;