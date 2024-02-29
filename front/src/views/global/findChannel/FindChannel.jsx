import "./style/FindChannel.scss";
import axios from "axios";
import { useState, useEffect } from "react";
import { useAuth } from "../../../store/auth/AuthContext";

export default function FindChannel() {
  const { userId } = useAuth();
  const [rooms, setRooms] = useState([]);

  console.log(userId);

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`http://localhost:3002/api/rooms`);
      const channels = response.data.filter(
        (room) =>
          room.type === "channel" &&
          room.owner !== userId &&
          !room.members.includes(userId)
      );
      setRooms(channels);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const joinRoom = async (roomId) => {
    console.log("Joining room", roomId);
    console.log("User id", userId);

    try {
      const userUpdateResponse = await axios.put(
        `http://localhost:3002/api/user/${userId}`,
        { roomId }
      );
      console.log("User's rooms updated successfully", userUpdateResponse.data);

      const roomUpdateResponse = await axios.put(
        `http://localhost:3002/api/room/${roomId}`,
        { memberId: userId }
      );
      console.log(
        "Room's members updated successfully",
        roomUpdateResponse.data
      );

      fetchRooms();
    } catch (error) {
      console.error("Error during the join process:", error);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [userId]);

  return (
    <div className="find-channels__container section__padding">
      <h2>Trouve ton channel dès maintenant !</h2>
      <div className="channels">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <div key={room._id} className="channel-card">
              <h4>{room.name}</h4>
              <i>{room.description}</i>
              <p>Created at: {formatDate(room.created_at)}</p>
              <p>Members: {room.members.length}</p>
              <p>Messages: {room.messages.length}</p>
              <button onClick={() => joinRoom(room._id)}>Join</button>
            </div>
          ))
        ) : (
          <i>Aucun channel à rejoindre pour le moment, reviens plus tard !</i>
        )}
      </div>
    </div>
  );
}
