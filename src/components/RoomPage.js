import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { searchYouTube } from '../youtube';
import Chat from './Chat';
import '../styles/RoomPage.css';
import { io } from 'socket.io-client';

const socket = io('https://roomzy-socket-server.onrender.com');

let isYouTubeAPILoaded = false;

function loadYouTubeAPI(onReady) {
  if (isYouTubeAPILoaded) {
    onReady();
    return;
  }

  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  window.onYouTubeIframeAPIReady = () => {
    isYouTubeAPILoaded = true;
    onReady();
  };
}

function RoomPage({ user }) {
  const { roomId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);

  useEffect(() => {
    loadYouTubeAPI(() => {
      if (!playerRef.current && playerContainerRef.current) {
        playerRef.current = new window.YT.Player(playerContainerRef.current, {
          height: '360',
          width: '640',
          videoId: '',
          playerVars: {
            autoplay: 1,
            controls: 1,
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              event.target.setVolume(volume * 100);
            },
            onStateChange: (event) => {
              const state = event.data;
              if (state === window.YT.PlayerState.PLAYING) {
                socket.emit('play', { roomId });
                setIsPlaying(true);
              } else if (state === window.YT.PlayerState.PAUSED) {
                socket.emit('pause', { roomId });
                setIsPlaying(false);
              }
            },
          },
        });
      }
    });

    socket.emit('joinRoom', { roomId, user });
    socket.emit('syncRequest', { roomId });

    socket.on('playVideo', ({ video }) => {
      setCurrentVideo(video);
      playerRef.current?.loadVideoById(video.id.videoId);
    });

    socket.on('play', () => {
      playerRef.current?.playVideo();
      setIsPlaying(true);
    });

    socket.on('pause', () => {
      playerRef.current?.pauseVideo();
      setIsPlaying(false);
    });

    socket.on('volumeChange', (newVolume) => {
      setVolume(newVolume);
      playerRef.current?.setVolume(newVolume * 100);
    });

    socket.on('syncState', ({ video, isPlaying, volume }) => {
      setCurrentVideo(video);
      setIsPlaying(isPlaying);
      setVolume(volume);
      if (video) {
        playerRef.current?.loadVideoById(video.id.videoId);
        playerRef.current?.setVolume(volume * 100);
        isPlaying ? playerRef.current?.playVideo() : playerRef.current?.pauseVideo();
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
    playerRef.current?.loadVideoById(video.id.videoId);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      playerRef.current?.pauseVideo();
      socket.emit('pause', { roomId });
    } else {
      playerRef.current?.playVideo();
      socket.emit('play', { roomId });
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    playerRef.current?.setVolume(newVolume * 100);
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
          <div ref={playerContainerRef} id="yt-player" />
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
          {currentVideo && (
            <p className="video-title">{currentVideo.snippet.title}</p>
          )}
        </div>
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
