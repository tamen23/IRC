import React, { useState, useEffect } from "react";
import axios from "axios";
import "./style/CreateChannel.scss";
import { useAuth } from "../../../store/auth/AuthContext";
import Select from "react-select";

export default function CreateServer() {
  const { userId } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [userOptions, setUserOptions] = useState([]);

  useEffect(() => {
    fetchFriends();
  }, [userId]);

  const fetchFriends = async () => {
    try {
      const userResponse = await axios.get(
        `http://localhost:3002/api/user/${userId}`
      );
      const userFriends = userResponse.data.friends;
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

      const acceptedFriendsDetails = await fetchFriendDetails(
        acceptedFriendsList
      );

      const friendsOptions = acceptedFriendsDetails.map((response) => ({
        value: response.data._id,
        label: response.data.username,
      }));

      setUserOptions(friendsOptions);
    } catch (error) {
      console.error("Erreur lors de la récupération des amis :", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newServer = {
      name,
      description,
      owner: userId,
      members: selectedMembers.map((member) => member.value),
    };

    try {
      const response = await axios.post(
        "http://localhost:3002/api/server",
        newServer
      );
      const createdServer = response.data;

      await axios.put(`http://localhost:3002/api/user/${userId}`, {
        serverId: createdServer._id,
      });

      const memberUpdatePromises = selectedMembers.map((member) =>
        axios.put(`http://localhost:3002/api/user/${member.value}`, {
          serverId: createdServer._id,
        })
      );

      await Promise.all(memberUpdatePromises);
    } catch (error) {
      console.error("Error during channel creation or user updates:", error);
    }
  };

  const handleSelectChange = (selectedOptions) => {
    setSelectedMembers(selectedOptions || []);
  };

  return (
    <div className="create-channel__container section__padding">
      <h2>Créons ton propre serveur 🚀</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Server Name"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Server Description"
          required
        />
        <Select
          isMulti
          options={userOptions}
          value={selectedMembers}
          onChange={handleSelectChange}
          className="basic-multi-select select-friends"
          classNamePrefix="select"
        />
        <div className="create-channel">
          <button type="submit">Create server</button>
        </div>
      </form>
    </div>
  );
}
