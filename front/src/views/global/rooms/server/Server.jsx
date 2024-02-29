import "./style/Server.scss";
import { useAuth } from "../../../../store/auth/AuthContext";
import axios from "axios";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const CreateChannelModal = ({ isOpen, onClose, onCreateChannel }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateChannel({ name, description, type: "channel" });
    onClose();
  };

  return (
    <div className="modal">
      <form onSubmit={handleSubmit}>
        <h2>Create Channel</h2>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Description:
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>
        <button type="submit">Create</button>
        <button onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
};

export default function Server() {
  const { userId } = useAuth();
  const [rooms, setRooms] = useState([]);

  const location = useLocation();
  const [ServerInfo, setServerInfo] = useState(null);

  const serverId = location.pathname.split("/")[2];

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [commandInput, setCommandInput] = useState("");

  const handleCommandInput = (e) => {
    const input = e.target.value;
    setCommandInput(input);
  };

  const handleCommandSubmit = async (e) => {
    e.preventDefault();

    if (commandInput.startsWith("/")) {
      const parts = commandInput.slice(1).split(" ");
      const command = parts[0];
      const args = parts.slice(1);

      switch (command) {
        case "create":
          if (args.length) {
            createChannel({
              name: args.join(" "),
              description: "Created via command",
            });
            setCommandInput("");
          }
          break;

        case "delete":
          if (args.length) {
            const channelNameToDelete = args.join(" ");
            const channelToDelete = ServerInfo.channels.find(
              (channel) => channel.name === channelNameToDelete
            );

            if (channelToDelete) {
              try {
                await axios.delete(
                  `http://localhost:3002/api/room/${channelToDelete._id}`
                );
                console.log(
                  `Channel ${channelNameToDelete} deleted successfully`
                );
              } catch (error) {
                console.error("Error deleting channel:", error);
              }
            } else {
              console.log(`Channel ${channelNameToDelete} not found`);
            }
            setCommandInput("");
          }
        case "list":
          const searchString = args.join(" ");
          let channelsToDisplay = ServerInfo.channels;

          if (searchString) {
            channelsToDisplay = channelsToDisplay.filter((channel) =>
              channel.name.toLowerCase().includes(searchString.toLowerCase())
            );
          }

          const alertMessage = channelsToDisplay
            .map((channel) => channel.name)
            .join("\n");

          alert("Available channels:\n" + alertMessage);
          setCommandInput("");
          break;

        default:
          console.log("Unknown command");
          setCommandInput("");
      }
    }
  };

  const updateServerWithNewRoom = async (roomId) => {
    try {
      const updateResponse = await axios.put(
        `http://localhost:3002/api/server/${serverId}`,
        {
          newChannelId: roomId,
        }
      );

      if (updateResponse.status === 200) {
        console.log("Server updated successfully with new room");
      } else {
        throw new Error("Failed to update server with new room");
      }
    } catch (error) {
      console.error("Error updating server with new room:", error);
    }
  };

  const addUserRoom = async (userId, roomId) => {
    try {
      await axios.put(`http://localhost:3002/api/user/${userId}`, {
        roomId: roomId,
      });
      console.log("User updated successfully with new room");
    } catch (error) {
      console.error("Error updating user with new room:", error);
    }
  };

  const createChannel = async (channelData) => {
    const { name, description } = channelData;
    if (!ServerInfo || !ServerInfo.members) {
      console.error("Server information or members not available");
      return;
    }

    try {
      const response = await axios.post(`http://localhost:3002/api/room`, {
        name,
        description,
        type: "channel",
        owner: userId,
        members: ServerInfo.members,
      });

      if (response.data && response.data._id) {
        const roomId = response.data._id;
        console.log("Channel created successfully", response.data);

        await updateServerWithNewRoom(roomId);
      } else {
        throw new Error("Room creation successful but no ID returned");
      }
      if (response.data && response.data._id) {
        const roomId = response.data._id;
        console.log("Channel created successfully", response.data);
        await addUserRoom(userId, roomId);
      }
    } catch (error) {
      console.error("Error creating channel:", error);
    }
  };

  useEffect(() => {
    const fetchServerInfo = async () => {
      try {
        const response = await fetch(
          `http://localhost:3002/api/server/${serverId}`
        );
        if (!response.ok) {
          throw new Error("Server data fetching failed");
        }
        const data = await response.json();
        setServerInfo(data);
      } catch (error) {
        console.error("Error fetching server information:", error);
      }
    };

    fetchServerInfo();
  }, [userId]);

  console.log(ServerInfo);

  return (
    <div className="section__padding server__container">
      {ServerInfo && (
        <div className="server__header">
          <h1>Serveur : {ServerInfo.name}</h1>
          <button onClick={() => setIsModalOpen(true)}>Create Channel</button>
          <CreateChannelModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onCreateChannel={createChannel}
          />
        </div>
      )}
      {ServerInfo && ServerInfo.channels && ServerInfo.channels.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div className="channel-cards">
            {ServerInfo.channels.map((channel) => (
              <Link key={channel._id} to={`/channel/${channel._id}`}>
                <div key={channel._id} className="channel-card">
                  <h3 className="channel-name">{channel.name}</h3>
                  <p className="channel-description">{channel.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <p>
            No channels for the moment, click on the button below to create one.
          </p>
        </div>
      )}

      <form onSubmit={handleCommandSubmit}>
        <input
          type="text"
          placeholder="Type a command..."
          required
          value={commandInput}
          onChange={handleCommandInput}
        />
        <button type="submit">
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
}
