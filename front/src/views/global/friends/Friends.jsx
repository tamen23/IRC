import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../store/auth/AuthContext";
import { useNavigate } from "react-router-dom";

import "./style/Friends.scss";

export default function Friends() {
  const [userConnected, setUserConnected] = useState([]);
  const [pendingFriends, setPendingFriends] = useState([]);
  const [acceptedFriends, setAcceptedFriends] = useState([]);
  const { userId } = useAuth();

  const navigate = useNavigate();

  const fetchFriends = async () => {
    try {
      const userResponse = await axios.get(
        `http://localhost:3002/api/user/${userId}`
      );
      setUserConnected(userResponse.data);
      const userFriends = userResponse.data.friends;

      const pendingFriendsList = userFriends.filter(
        (friend) => friend.status === "pending"
      );
      const acceptedFriendsList = userFriends.filter(
        (friend) => friend.status === "accepted"
      );

      const fetchFriendDetails = async (friendsList) => {
        return await Promise.all(
          friendsList.map((friend) =>
            axios.get(`http://localhost:3002/api/user/${friend.friendId}`)
          )
        );
      };

      const pendingFriendsDetails = await fetchFriendDetails(
        pendingFriendsList
      );
      const acceptedFriendsDetails = await fetchFriendDetails(
        acceptedFriendsList
      );

      setPendingFriends(pendingFriendsDetails.map((response) => response.data));
      setAcceptedFriends(
        acceptedFriendsDetails.map((response) => response.data)
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des amis :", error);
    }
  };

  const handleAcceptFriend = async (friendId) => {
    try {
      const currentUserResponse = await axios.get(
        `http://localhost:3002/api/user/${userId}`
      );
      let currentUser = currentUserResponse.data;

      const updatedCurrentUserFriends = currentUser.friends.map((friend) =>
        friend.friendId === friendId
          ? { ...friend, status: "accepted" }
          : friend
      );

      await axios.put(`http://localhost:3002/api/user/${userId}`, {
        friends: updatedCurrentUserFriends,
      });

      const friendResponse = await axios.get(
        `http://localhost:3002/api/user/${friendId}`
      );
      let friendUser = friendResponse.data;

      const updatedFriendUserFriends = friendUser.friends.map((friend) =>
        friend.friendId === userId ? { ...friend, status: "accepted" } : friend
      );

      await axios.put(`http://localhost:3002/api/user/${friendId}`, {
        friends: updatedFriendUserFriends,
      });

      fetchFriends();
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleRejectFriend = async (friendId) => {
    try {
      const currentUserResponse = await axios.get(
        `http://localhost:3002/api/user/${userId}`
      );
      let currentUser = currentUserResponse.data;

      const updatedCurrentUserFriends = currentUser.friends.map((friend) =>
        friend.friendId === friendId
          ? { ...friend, status: "rejected" }
          : friend
      );

      await axios.put(`http://localhost:3002/api/user/${userId}`, {
        friends: updatedCurrentUserFriends,
      });

      const friendResponse = await axios.get(
        `http://localhost:3002/api/user/${friendId}`
      );
      let friendUser = friendResponse.data;

      const updatedFriendUserFriends = friendUser.friends.map((friend) =>
        friend.friendId === userId ? { ...friend, status: "rejected" } : friend
      );

      await axios.put(`http://localhost:3002/api/user/${friendId}`, {
        friends: updatedFriendUserFriends,
      });

      fetchFriends();
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  const updateUserRooms = async (userIdToUpdate, newRoomId) => {
    try {
      const response = await axios.put(
        `http://localhost:3002/api/user/${userIdToUpdate}`,
        {
          $push: { rooms: newRoomId },
        }
      );
      console.log(
        `User ${userIdToUpdate}'s rooms updated with new room`,
        response.data
      );
      return true;
    } catch (error) {
      console.error(`Error updating user ${userIdToUpdate}'s rooms:`, error);
      return false;
    }
  };

  const handleMessageIconClick = async (friendId) => {
    if (userConnected && Array.isArray(userConnected.rooms)) {
      const sharedPrivateRoom = userConnected.rooms.find(
        (room) =>
          room &&
          room.type === "private" &&
          room.members.map(String).includes(String(userId)) &&
          room.members.map(String).includes(String(friendId))
      );

      if (sharedPrivateRoom) {
        navigate(`/private/${sharedPrivateRoom._id}`);
      } else {
        console.log("No shared private room found. Creating a new one...");
        try {
          const response = await axios.post("http://localhost:3002/api/room", {
            type: "private",
            members: [userId, friendId],
          });
          const newRoomId = response.data._id;
          console.log("New private room created:", newRoomId);

          const successUser = await updateUserRooms(userId, newRoomId);
          const successFriend = await updateUserRooms(friendId, newRoomId);

          if (successUser && successFriend) {
            fetchFriends();
            navigate(`/private/${newRoomId}`);
          }
        } catch (error) {
          console.error("Error creating new room:", error);
        }
      }
    } else {
      console.log("userConnected.rooms is not initialized properly.");
    }
  };

  useEffect(() => {
    fetchFriends();
  }, [userId]);

  return (
    <div className="friends-container section__padding">
      <h2>Mes amis</h2>
      <div>
        <h5>Amis en attente</h5>
        <div className="friends">
          {pendingFriends.map((friend) => (
            <div key={friend._id} className="friend">
              <p>{friend.username}</p>

              <div className="icons">
                <button onClick={() => handleRejectFriend(friend._id)}>
                  <i className="fa-solid fa-times reject"></i>
                </button>
                <button onClick={() => handleAcceptFriend(friend._id)}>
                  <i className="fa-solid fa-check accept"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
        <h5>Amis acceptés</h5>
        <div className="friends">
          {acceptedFriends.map((friend) => (
            <div key={friend._id} className="friend">
              <p>{friend.username}</p>

              <div className="icons">
                <button onClick={() => handleMessageIconClick(friend._id)}>
                  <i className="fa-solid fa-message message"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
