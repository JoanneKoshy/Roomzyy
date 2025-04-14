// src/components/RoomListPage.js
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function RoomListPage() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      const querySnapshot = await getDocs(collection(db, 'rooms'));
      const roomList = querySnapshot.docs.map(doc => doc.data());
      setRooms(roomList);
    };

    fetchRooms();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">🔥 MusToog Rooms</h1>
      {rooms.map((room, index) => (
        <div key={index} className="bg-white text-black rounded shadow p-4 mb-2">
          🎵 <strong>{room.roomName}</strong> created by {room.createdBy}
        </div>
      ))}
    </div>
  );
}

export default RoomListPage;
