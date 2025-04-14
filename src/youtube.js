// src/youtube.js
const API_KEY = 'AIzaSyCYrCpSmPa37f8svRRUeoOjXC7GY4glUu0';

export const searchYouTube = async (query) => {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(query)}&key=${API_KEY}`
  );
  const data = await res.json();
  return data.items;
};
