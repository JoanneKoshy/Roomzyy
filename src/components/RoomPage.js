// src/components/RoomPage.js
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { searchYouTube } from '../youtube'; // your YouTube API handler
import Chat from './Chat'; // Import the Chat component
import '../styles/RoomPage.css'; // Import the CSS file

function RoomPage({ user }) {
  const { roomId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const handleSearch = async () => {
    if (searchTerm) {
      const items = await searchYouTube(searchTerm);
      setResults(items);
    }
  };

  return (
    <div className="room-page-container">
      {/* Left - Search */}
      <div className="search-container">
        <h2 className="section-title">Search Song</h2>
        <div className="search-bar">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search YouTube..."
            className="search-input"
          />
          <button
            onClick={handleSearch}
            className="search-button"
          >
            Search
          </button>
        </div>

        <ul className="search-results">
          {results.map((video) => (
            <li
              key={video.id.videoId}
              className="video-item"
              onClick={() => setSelectedVideo(video)}
            >
              {video.snippet.title}
            </li>
          ))}
        </ul>
      </div>

      {/* Middle - Video */}
      <div className="video-container">
        <h2 className="section-title"> Now Playing!</h2>
        <div className="video-player">
          {selectedVideo ? (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${selectedVideo.id.videoId}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="no-video">
              <p>Select a video to play</p>
            </div>
          )}
        </div>
        {selectedVideo && (
          <p className="video-title">{selectedVideo.snippet.title}</p>
        )}
      </div>

      {/* Right - Chat */}
      <div className="chat-container">
        <h2 className="section-title">Chat</h2>
        <Chat roomId={roomId} user={user} /> {/* Render the Chat Component */}
      </div>
    </div>
  );
}

export default RoomPage;
