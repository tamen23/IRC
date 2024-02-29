import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import { useAuth } from "../../../../store/auth/AuthContext";
import "./style/ChannelRoom.scss";

const socket = io("http://localhost:3002");

export default function ChannelRoom() {
  const { userId } = useAuth();
  const location = useLocation();
  const [channelInfo, setChannelInfo] = useState(null);
  const [messageContent, setMessageContent] = useState("");
  const [membersCount, setMembersCount] = useState(0);
  const [userCache, setUserCache] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [commandInput, setCommandInput] = useState("");

  const handleCommandSubmit = async (e) => {
    e.preventDefault();
    if (commandInput.startsWith("/")) {
      const parts = commandInput.slice(1).split(" ");
      const command = parts[0];

      if (command === "users" && channelInfo) {
        const userIds = [channelInfo.owner];

        channelInfo.members.forEach((memberId) => {
          if (memberId !== channelInfo.owner && !userIds.includes(memberId)) {
            userIds.push(memberId);
          }
        });

        const userNames = await Promise.all(
          userIds.map(async (id) => {
            if (!userCache[id]) {
              const userData = await fetchUserInfo(id);
              return userData.username;
            }
            return userCache[id].username;
          })
        );
        alert("Users in channel:\n" + userNames.join("\n"));
      }

      setCommandInput("");
    }
  };

  const handleDoubleClick = () => {
    if (userId === channelInfo.owner) {
      setIsEditing(true);
      setNewChannelName(channelInfo.name);
    }
  };

  const handleNameChange = (e) => {
    setNewChannelName(e.target.value);
  };

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:3002/api/room/${channelInfo._id}`,
        {
          name: newChannelName,
        }
      );
      setChannelInfo((prev) => ({ ...prev, name: newChannelName }));
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating channel name:", error);
    }
  };

  console.log(channelInfo);

  const handleLeaveChannel = async () => {
    try {
      let response = await axios.put(
        `http://localhost:3002/api/room/${channelInfo._id}`,
        { removeMemberId: userId }
      );

      if (response.status === 200) {
        console.log("Member removed successfully from the channel");
        setChannelInfo((prev) => ({
          ...prev,
          members: prev.members.filter((member) => member !== userId),
        }));

        if (response.status === 200) {
          console.log("Channel removed from user successfully");
          navigate("/home");
        } else {
          throw new Error("Failed to remove channel from user");
        }
      } else {
        throw new Error("Failed to remove member from channel");
      }
    } catch (error) {
      console.error("Error in handleLeaveChannel:", error);
    }
  };

  const channelId = location.pathname.split("/")[2];

  const navigate = useNavigate();

  const handleDeleteChannel = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:3002/api/room/${channelInfo._id}`
      );
      navigate(-1);
    } catch (error) {
      console.error("Error deleting channel:", error);
    }
  };

  const fetchUserInfo = async (userId) => {
    if (userCache[userId]) {
      return userCache[userId];
    }
    try {
      const response = await fetch(`http://localhost:3002/api/user/${userId}`);
      if (!response.ok) {
        throw new Error("User data fetching failed");
      }
      const userData = await response.json();
      setUserCache((prevCache) => ({ ...prevCache, [userId]: userData }));
      return userData;
    } catch (error) {
      console.error("Error fetching user information:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchChannelInfo = async () => {
      try {
        const response = await fetch(
          `http://localhost:3002/api/room/${channelId}`
        );
        if (!response.ok) {
          throw new Error("Channel data fetching failed");
        }
        const data = await response.json();
        setChannelInfo(data);
        setMembersCount(data.members.length);
      } catch (error) {
        console.error("Error fetching channel information:", error);
      }
    };

    fetchChannelInfo();

    const handleNewMessage = (message) => {
      setChannelInfo((prevChannelInfo) => {
        const updatedMessages = [...prevChannelInfo.messages, message];
        return { ...prevChannelInfo, messages: updatedMessages };
      });
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [channelId]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    const messageData = {
      roomId: channelId,
      sender: userId,
      receiver: channelId,
      content: messageContent,
      type: "channel",
    };

    socket.emit("sendMessage", messageData);
    setMessageContent("");
  };

  useEffect(() => {
    channelInfo?.messages.forEach((message) => {
      const senderId = message.sender;
      if (!userCache[senderId]) {
        fetchUserInfo(senderId);
      }
    });
  }, [channelInfo, userCache]);

  return (
    <div className="channel-room__container section__padding">
      {channelInfo ? (
        <div>
          <div>
            {!isEditing ? (
              <h1 onDoubleClick={handleDoubleClick}>{channelInfo.name}</h1>
            ) : (
              <form onSubmit={handleNameSubmit}>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={handleNameChange}
                  autoFocus
                />
                <button type="submit">Save</button>
              </form>
            )}

            {userId === channelInfo.owner && (
              <i
                className="fa-solid fa-trash"
                onClick={handleDeleteChannel}
              ></i>
            )}
            {userId !== channelInfo.owner && (
              <i
                onClick={handleLeaveChannel}
                className="fa-solid fa-person-walking-arrow-right"
              ></i>
            )}
          </div>

          <p>Members: {membersCount + 1}</p>

          <div className="messages-container">
            {channelInfo.messages.map((message, index) => (
              <div
                key={index}
                className={`message ${
                  message.sender === userId
                    ? "message-sent"
                    : "message-received"
                }`}
              >
                <p>
                  <strong>
                    {userCache[message.sender]
                      ? userCache[message.sender].username
                      : "Fetching..."}
                  </strong>
                  : {message.content}
                </p>
              </div>
            ))}
          </div>

          <form onSubmit={handleCommandSubmit}>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Type a command..."
              required
            />
            <button type="submit">
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </form>

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
        <p>Loading channel information...</p>
      )}
    </div>
  );
}
