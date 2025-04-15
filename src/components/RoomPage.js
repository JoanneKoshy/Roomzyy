import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { searchYouTube } from '../youtube';
import Chat from './Chat';
import '../styles/RoomPage.css';
import { io } from 'socket.io-client';

const socket = io('https://roomzy-socket-server.onrender.com');

function RoomPage({ user }) {
  const { roomId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const videoRef = useRef(null);

  useEffect(() => {
    socket.emit('joinRoom', { roomId, user });
    socket.emit('syncRequest', { roomId });

    socket.on('playVideo', ({ video }) => {
      setCurrentVideo(video);
      videoRef.current.contentWindow?.postMessage(`{"event":"command","func":"loadVideoById","args":["${video.id.videoId}"]}`, '*');
    });

    socket.on('play', () => {
      videoRef.current.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      setIsPlaying(true);
    });

    socket.on('pause', () => {
      videoRef.current.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      setIsPlaying(false);
    });

    socket.on('volumeChange', (newVolume) => {
      setVolume(newVolume);
      videoRef.current.contentWindow?.postMessage(`{"event":"command","func":"setVolume","args":[${newVolume * 100}]}`, '*');
    });

    socket.on('syncState', ({ video, isPlaying, volume }) => {
      setCurrentVideo(video);
      setIsPlaying(isPlaying);
      setVolume(volume);
      if (videoRef.current && video) {
        videoRef.current.contentWindow?.postMessage(`{"event":"command","func":"${isPlaying ? 'playVideo' : 'pauseVideo'}","args":""}`, '*');
        videoRef.current.contentWindow?.postMessage(`{"event":"command","func":"setVolume","args":[${volume * 100}]}`, '*');
      }
    });

    socket.on('userJoined', ({ user }) => {
      console.log(`${user} joined the room`);
    });

    socket.on('userLeft', ({ user }) => {
      console.log(`${user} left the room`);
    });

    return () => {
      socket.emit('leaveRoom', { roomId, user });
      socket.off('playVideo');
      socket.off('play');
      socket.off('pause');
      socket.off('volumeChange');
      socket.off('syncState');
      socket.off('userJoined');
      socket.off('userLeft');
    };
  }, [roomId, user]);

  const handleSearch = async () => {
    if (searchTerm) {
      const items = await searchYouTube(searchTerm);
      setResults(items);
    }
  };

  const handlePlayVideo = (video) => {
    setCurrentVideo(video);
    socket.emit('playVideo', { roomId, video });
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      socket.emit('pause', roomId);
    } else {
      socket.emit('play', roomId);
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    socket.emit('volumeChange', { roomId, volume: newVolume });
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
          <button onClick={handleSearch} className="search-button">
            Search
          </button>
        </div>

        <ul className="search-results">
          {results.map((video) => (
            <li
              key={video.id.videoId}
              className="video-item"
              onClick={() => handlePlayVideo(video)}
            >
              {video.snippet.title}
            </li>
          ))}
        </ul>
      </div>

      {/* Middle - Video */}
      <div className="video-container">
        <h2 className="section-title">Now Playing!</h2>
        <div className="video-player">
          {currentVideo ? (
            <>
              <iframe
                ref={videoRef}
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${currentVideo.id.videoId}?autoplay=1&enablejsapi=1&origin=${window.location.origin}`}
                title="YouTube video player"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              ></iframe>
              <div className="controls">
                <button onClick={togglePlayPause} className="play-pause-button">
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                />
              </div>
            </>
          ) : (
            <div className="no-video">
              <p>Select a video to play</p>
            </div>
          )}
        </div>
        {currentVideo && (
          <p className="video-title">{currentVideo.snippet.title}</p>
        )}
      </div>

      {/* Right - Chat */}
      <div className="chat-container">
        <h2 className="section-title">Chat</h2>
        <Chat roomId={roomId} user={user} />
      </div>
    </div>
  );
}

export default RoomPage;
