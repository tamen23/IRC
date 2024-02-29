import "./style/AddFriends.scss";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../store/auth/AuthContext";

export default function () {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const { userId } = useAuth();

  useEffect(() => {
    if (searchTerm) {
      axios
        .get(`http://localhost:3002/api/users?search=${searchTerm}`)
        .then((response) => {
          const filteredResults = response.data.filter(
            (user) => user._id !== userId && user.status !== "admin"
          );
          setSearchResults(filteredResults);
        })
        .catch((error) => {
          console.error("Erreur lors de la recherche d'utilisateurs :", error);
        });
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, userId]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddFriend = async (friendId) => {
    try {
      const currentUserResponse = await axios.get(
        `http://localhost:3002/api/user/${userId}`
      );
      const currentUser = currentUserResponse.data;

      const isAlreadyFriend = currentUser.friends.some(
        (friend) => friend.friendId === friendId
      );

      if (isAlreadyFriend) {
        console.log("Cet utilisateur est déjà votre ami.");
      } else {
        const updatedCurrentUserFriends = [
          ...currentUser.friends,
          { friendId, status: "pending" },
        ];

        await axios.put(`http://localhost:3002/api/user/${userId}`, {
          friends: updatedCurrentUserFriends,
        });

        const friendResponse = await axios.get(
          `http://localhost:3002/api/user/${friendId}`
        );
        const friendUser = friendResponse.data;

        const updatedFriendUserFriends = [
          ...friendUser.friends,
          { friendId: userId, status: "pending" },
        ];

        await axios.put(`http://localhost:3002/api/user/${friendId}`, {
          friends: updatedFriendUserFriends,
        });

        console.log("Ami ajouté avec succès.");
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'ami :", error);
    }
  };

  return (
    <div className="addfriends-container section__padding">
      <h2>Ajouter un ami</h2>
      <input
        type="text"
        placeholder="Rechercher par nom d'utilisateur"
        value={searchTerm}
        onChange={handleInputChange}
      />
      <div className="results-container">
        {searchResults.map((user) => (
          <div key={user._id} className="result">
            {user.username}
            <button onClick={() => handleAddFriend(user._id)}>
              Ajouter en ami
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
