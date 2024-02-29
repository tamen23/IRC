import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./style/PrivateRoom.scss";
import io from "socket.io-client";
import { useAuth } from "../../../../store/auth/AuthContext";

const socket = io("http://localhost:3002");

export default function PrivateRoom() {
  const { userId } = useAuth();
  const location = useLocation();
  const [roomInfos, setRoomInfos] = useState(null);
  const [userFriend, setUserFriend] = useState(null);
  const [messageContent, setMessageContent] = useState("");

  const roomId = location.pathname.split("/")[2];

  const messagesEndRef = useRef(null);

  const handleSendMessage = (e) => {
    e.preventDefault();

    const messageData = {
      roomId,
      sender: userId,
      receiver: userFriend._id,
      content: messageContent,
      type: "private",
    };

    socket.emit("sendMessage", messageData);

    setMessageContent("");
  };

  const fetchUserFriendInfos = async (friendId) => {
    try {
      const userFriendResponse = await fetch(
        `http://localhost:3002/api/user/${friendId}`
      );
      if (!userFriendResponse.ok) {
        throw new Error("User data fetching failed");
      }
      const userFriendData = await userFriendResponse.json();
      setUserFriend(userFriendData);
    } catch (error) {
      console.error("Error fetching user information:", error);
    }
  };

  useEffect(() => {
    const fetchRoomInfos = async () => {
      try {
        const response = await fetch(
          `http://localhost:3002/api/room/${roomId}`
        );
        if (!response.ok) {
          throw new Error("Room data fetching failed");
        }
        const data = await response.json();
        setRoomInfos(data);

        const friendId = data.members.filter(
          (memberId) => memberId !== userId
        )[0];
        fetchUserFriendInfos(friendId);
      } catch (error) {
        console.error("Error fetching room information:", error);
      }
    };

    fetchRoomInfos();

    const handleNewMessage = (message) => {
      setRoomInfos((prevRoomInfos) => {
        const updatedMessages = [...prevRoomInfos.messages, message];
        return { ...prevRoomInfos, messages: updatedMessages };
      });
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [roomId, userId]);

  return (
    <div className="privateroom-container section__padding">
      {roomInfos ? (
        <div>
          {userFriend && <h1>{userFriend.username}</h1>}

          <div className="messages-container" ref={messagesEndRef}>
            {roomInfos.messages.map((message) => (
              <div
                key={message._id}
                className={`message ${
                  message.sender === userId
                    ? "message-sent"
                    : "message-received"
                }`}
              >
                <p>{message.content}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage}>
            <input
              type="text"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Type a message..."
              required
            />
            <button type="submit">
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </form>
        </div>
      ) : (
        <p>Loading room information...</p>
      )}
    </div>
  );
}
