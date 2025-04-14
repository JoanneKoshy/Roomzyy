import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [showPopup, setShowPopup] = useState(false); // 👀 Popup flag

  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          setUsername(userSnap.data().username || "");
        }
      }
    };

    fetchUsername();
  }, [user]);

  // 🔥 Room code generator
  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8); // 6-char alphanumeric
  };

  const handleCreateRoom = async () => {
    const newRoomCode = generateRoomCode();

    try {
      await setDoc(doc(db, "rooms", newRoomCode), {
        createdBy: user.uid,
        createdAt: new Date(),
        members: [user.uid],
      });

      setRoomCode(newRoomCode);
      setShowPopup(true); // Show the popup with room code

      // 🕒 Navigate after 3 seconds
      setTimeout(() => {
        navigate(`/room/${newRoomCode}`);
      }, 5000);
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room.");
    }
  };

  const handleJoinRoom = async () => {
    const code = prompt("Enter Room Code:");
    if (!code) return;

    try {
      const roomRef = doc(db, "rooms", code);
      const roomSnap = await getDoc(roomRef);

      if (roomSnap.exists()) {
        navigate(`/room/${code}`);
      } else {
        alert("Room not found!");
      }
    } catch (error) {
      console.error("Error joining room:", error);
      alert("Something went wrong!");
    }
  };

  const copyRoomCodeToClipboard = () => {
    if (roomCode) {
      navigator.clipboard
        .writeText(roomCode)
        .then(() => alert("Room code copied!"))
        .catch((error) =>
          console.error("Error copying to clipboard:", error)
        );
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome, {username || user?.email || "Guest"}</h1>

      <div className="dashboard-buttons">
        <button onClick={handleJoinRoom}>Join a Room</button>
        <button onClick={handleCreateRoom}>Create a Room</button>
      </div>

      {/* 💥 POPUP with room code */}
      {showPopup && (
        <div className="room-popup">
          <div className="room-popup-content">
            <h2>Room Created!</h2>
            <p>Share this code to invite others:</p>
            <p className="room-code-display">{roomCode}</p>
            <button onClick={copyRoomCodeToClipboard}>📋 Copy Code</button>
            <p className="room-popup-note">Redirecting to room in 3 seconds...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
