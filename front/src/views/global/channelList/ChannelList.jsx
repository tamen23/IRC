import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../store/auth/AuthContext";
import { useNavigate } from "react-router-dom";

import "./style/ChannelList.scss";

export default function ChannelsList() {
  const [userConnected, setUserConnected] = useState([]);
  const [publicRoomsWithMemberInfo, setPublicRoomsWithMemberInfo] = useState(
    []
  );
  const { userId } = useAuth();
  const navigate = useNavigate();

  console.log(publicRoomsWithMemberInfo);

  const fetchMemberInfo = async (otherMemberId) => {
    try {
      const response = await axios.get(
        `http://localhost:3002/api/user/${otherMemberId}`
      );
      return response.data;
    } catch (error) {
      console.error("Erreur de récupération des infos du user:", error);
      return null;
    }
  };

  const fetchUserConnectedChannels = async () => {
    try {
      const userResponse = await axios.get(
        `http://localhost:3002/api/user/${userId}`
      );
      setUserConnected(userResponse.data);

      const sortedRooms = userResponse.data.rooms.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      const lastUpdatedPublicRooms = sortedRooms
        .filter((room) => room.type === "channel")
        .slice(0, 5);

      for (const room of lastUpdatedPublicRooms) {
        const otherMemberId = room.members.find((id) => id !== userId);
        if (otherMemberId) {
          const memberInfo = await fetchMemberInfo(otherMemberId);
          room.otherMemberUsername = memberInfo
            ? memberInfo.username
            : "Inconnu";
        }
      }
      setPublicRoomsWithMemberInfo(lastUpdatedPublicRooms);
    } catch (error) {
      console.error("Erreur d'affichage des channels du user connecté:", error);
    }
  };

  const handleMessageIconClick = (roomID) => {
    navigate(`/room/${roomID}`);
  };

  useEffect(() => {
    fetchUserConnectedChannels();
  }, []);

  return (
    <div className="channels-list-container">
      <div>
        <h2 className="channel-list-title">Mes serveurs</h2>
        <ul className="channels-list">
          {publicRoomsWithMemberInfo.map((room) => (
            <li key={room._id} className="channel-item">
              <button onClick={() => handleMessageIconClick(room._id)}>
                <p>{room.otherMemberUsername}</p>
                <i className="fa-solid fa-message"></i>
              </button>
              <span className="channel-name">{room.title}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <Link to={"/create-server"} className="create-channel-button">
          <div>
            <button>Créer un serveur</button>
          </div>
        </Link>
      </div>
    </div>
  );
}
