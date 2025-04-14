import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, serverTimestamp, onSnapshot } from 'firebase/firestore';

const Chat = ({ roomId, user }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Real-time listener for messages in the room
    const q = query(
      collection(db, 'rooms', roomId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData = querySnapshot.docs.map((doc) => doc.data());
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [roomId]);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (message.trim()) {
      await addDoc(collection(db, 'rooms', roomId, 'messages'), {
        text: message,
        sender: user.email, // Use logged-in user's email here
        timestamp: serverTimestamp(),
      });

      setMessage('');
    }
  };

  return (
    <div className="flex flex-col p-4 bg-gray-800 rounded-lg text-white h-80 overflow-auto">
      <div className="flex-grow">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 flex ${msg.sender === user.email ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex flex-col ${msg.sender === user.email ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'} p-2 rounded-lg max-w-xs`}
            >
              <strong>{msg.sender}</strong>
              <p>{msg.text}</p>
              <span className="text-xs text-gray-400">{new Date(msg.timestamp?.seconds * 1000).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="flex mt-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-grow px-4 py-2 bg-gray-600 text-white rounded-lg"
          placeholder="Type a message"
        />
        <button type="submit" className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
