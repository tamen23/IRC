import { useState, useEffect } from "react";
import axios from "axios";
import "./style/AdminHome.scss";

export default function AdminHome() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filter, setFilter] = useState("unvalid");
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(15);

  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
  });

  const [newUserForm, setNewUserForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });

  const button_confirm = async (userId) => {
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "valid",
      }),
    };

    try {
      const response = await fetch(
        `http://localhost:3002/api/user/${userId}`,
        options
      );
      const updatedUser = await response.json();

      const updatedUsers = users.map((user) => {
        if (user._id === userId) {
          return {
            ...user,
            status: "valid",
            confirmedAt: updatedUser.confirmedAt,
          };
        }
        return user;
      });
      setUsers(updatedUsers);

      const updatedFilteredUsers = updatedUsers.filter((user) => {
        if (filter === "all") {
          return true;
        }
        return user.status === filter;
      });
      setFilteredUsers(updatedFilteredUsers);
    } catch (err) {
      console.log(err);
    }
  };

  const button_unconfirm = async (userId) => {
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "unvalid",
      }),
    };

    try {
      const response = await fetch(
        `http://localhost:3002/api/user/${userId}`,
        options
      );
      const data = await response.json();
      console.log(data);

      const updatedUsers = users.map((user) => {
        if (user._id === userId) {
          return { ...user, status: "unvalid" };
        }
        return user;
      });
      setUsers(updatedUsers);

      const updatedFilteredUsers = updatedUsers.filter((user) => {
        if (filter === "all") {
          return true;
        }
        return user.status === filter;
      });
      setFilteredUsers(updatedFilteredUsers);
    } catch (err) {
      console.log(err);
    }
  };

  const button_delete = (userId) => {
    axios
      .delete(`http://localhost:3002/api/user/${userId}`)
      .then((response) => {
        const updatedUsers = users.filter((user) => user._id !== userId);
        setUsers(updatedUsers);

        const updatedFilteredUsers = updatedUsers.filter((user) => {
          if (filter === "all") {
            return true;
          }
          return user.status === filter;
        });
        setFilteredUsers(updatedFilteredUsers);
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  };

  const handleEditUser = (user) => {
    console.log("Editing user:", user);
    setFormData({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
    });
    setCurrentUserId(user._id);
    setShowModal(true);
  };

  const handleUpdate = async (userId) => {
    try {
      // Mise à jour de l'utilisateur en local
      const updatedUsers = users.map((user) =>
        user._id === userId ? { ...user, ...formData } : user
      );
      setUsers(updatedUsers);

      const updatedFilteredUsers = updatedUsers.filter(
        (user) =>
          (user.status === filter || filter === "all") &&
          (user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(updatedFilteredUsers);

      const response = await axios.put(
        `http://localhost:3002/api/user/${userId}`,
        formData
      );
      console.log(response.data);

      setShowModal(false);
    } catch (error) {
      console.log("Error in handleUpdate:", error);
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3002/api/user",
        newUserForm
      );
      const newUser = response.data;

      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);

      const updatedFilteredUsers = updatedUsers.filter((user) => {
        if (filter === "all") {
          return true;
        }
        return user.status === filter;
      });
      setFilteredUsers(updatedFilteredUsers);

      setShowCreateModal(false);
      setNewUserForm({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleFilterChange = (e) => {
    const newFilter = e.target.value;
    setFilter(newFilter);
    if (newFilter === "all") {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter((user) => user.status === newFilter));
    }
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredUsers.length / usersPerPage); i++) {
    pageNumbers.push(i);
  }

  function formatDate(date) {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  useEffect(() => {
    axios
      .get("http://localhost:3002/api/users")
      .then((response) => {
        const nonAdminUsers = response.data.filter(
          (user) => user.status !== "admin"
        );
        setUsers(nonAdminUsers);
        const updatedFilteredUsers = nonAdminUsers.filter(
          (user) =>
            (user.status === filter || filter === "all") &&
            (user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredUsers(updatedFilteredUsers);
        console.log("Loaded users:", users);
        console.log("Loaded filteredUsers:", filteredUsers);
      })
      .catch((error) => {
        console.log("Error: ", error);
      });
  }, [filter, searchTerm]);

  return (
    <>
      <div>
        <button className="create" onClick={() => setShowCreateModal(true)}>
          Create User
        </button>

        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Create new user</h2>
              <input
                type="text"
                value={newUserForm.firstname}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, firstname: e.target.value })
                }
                placeholder="First Name"
              />
              <input
                type="text"
                value={newUserForm.lastname}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, lastname: e.target.value })
                }
                placeholder="Last Name"
              />
              <input
                type="text"
                value={newUserForm.email}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, email: e.target.value })
                }
                placeholder="Email"
              />
              <input
                type="text"
                value={newUserForm.password}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, password: e.target.value })
                }
                placeholder="Password"
              />

              <div className="buttons">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="cancel"
                >
                  Cancel
                </button>
                <button onClick={handleCreateUser} className="confirm">
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="section__padding persons">
          <h1>Liste utilisateurs</h1>

          <div className="select__container">
            <select
              className="select-filter"
              onChange={handleFilterChange}
              value={filter}
            >
              <option value="unvalid">Non validé</option>
              <option value="valid">Validé</option>
              <option value="all">Tous</option>
            </select>

            <input
              type="text"
              className="input-search"
              placeholder="Rechercher par nom, prénom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="persons__container">
            {currentUsers.map((user) => (
              <div key={user._id} className="persons__card">
                <h3>
                  {user.firstname} {user.lastname}
                </h3>
                <p className="email">
                  <i>Email</i> : {user.email}
                </p>
                <p>
                  <i>Status</i>: {user.status}
                </p>
                <p>
                  <i>Création</i>: {formatDate(user.createdAt)}
                </p>
                {user.status === "valid" && (
                  <p>
                    <i>Date de confirmation</i>:{" "}
                    {user.confirmedAt
                      ? formatDate(user.confirmedAt)
                      : "Non confirmé"}
                  </p>
                )}
                <div className="buttons">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="update"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => button_delete(user._id)}
                    className="delete"
                  >
                    Delete
                  </button>
                  {user.status === "unvalid" && (
                    <button
                      onClick={() => button_confirm(user._id)}
                      className="confirm"
                    >
                      Confirm
                    </button>
                  )}
                  {user.status === "valid" && (
                    <button
                      onClick={() => button_unconfirm(user._id)}
                      className="unconfirm"
                    >
                      Invalider
                    </button>
                  )}
                </div>
              </div>
            ))}

            {showModal && (
              <div className="modal-overlay">
                <div className="modal">
                  <h2>Edit user infos</h2>
                  <input
                    type="text"
                    value={formData.firstname}
                    onChange={(e) =>
                      setFormData({ ...formData, firstname: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    value={formData.lastname}
                    onChange={(e) =>
                      setFormData({ ...formData, lastname: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />

                  <div className="buttons">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setCurrentUserId(null);
                      }}
                      className="cancel"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdate(currentUserId)}
                      className="update"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <nav>
          <ul className="pagination">
            <li className="page-item">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="page-link"
                disabled={currentPage === 1}
              >
                &laquo;
              </button>
            </li>
            <li className="page-item">
              <span className="page-link">{currentPage}</span>
            </li>
            {currentPage < Math.ceil(filteredUsers.length / usersPerPage) && (
              <li className="page-item">
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="page-link"
                >
                  &raquo;
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </>
  );
}
