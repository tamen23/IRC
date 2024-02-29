const jwt = require("jsonwebtoken");
require("dotenv").config();

let People = require("../model/UserModel");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

// create and save people

exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "Content can't be empty !" });
    return;
  }

  bcrypt.hash(req.body.password, saltRounds, (err, hashedPassword) => {
    if (err) {
      return res.status(500).send({ message: "Error hashing password" });
    }

    // new people

    const people = new People({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: hashedPassword,
      username: req.body.username,
    });

    // save the people in the db

    people
      .save()
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occured while doing a create operation",
        });
      });
  });
};

// find and return all people

exports.find = async (req, res) => {
  try {
    const searchTerm = req.query.search;
    let query = People.find().populate("rooms");

    if (searchTerm) {
      const regex = new RegExp("^" + searchTerm, "i");
      query.where({ username: { $regex: regex } });
    }

    const users = await query.exec();
    res.json(users);
  } catch (error) {
    console.error("Erreur lors de la recherche d'utilisateurs :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la recherche d'utilisateurs" });
  }
};

// find and return only one people

exports.findOne = (req, res) => {
  const id = req.params.id;

  People.findById(id)
    .populate("servers")
    .populate("rooms")
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `We can't find the people with id ${id}. Maybe it doesn't exist`,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error when finding people information",
      });
    });
};

// Update a people thanks its id

exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: "Data to update can't be empty" });
  }

  const id = req.params.id;
  const { friendId, serverId, roomId, ...updateData } = req.body;

  if (friendId) {
    People.findById(id)
      .then((user) => {
        if (!user) {
          return res
            .status(404)
            .send({ message: `User not found with ID: ${id}` });
        }

        const friendExists = user.friends.some((friend) =>
          friend.friendId.equals(friendId)
        );
        if (friendExists) {
          return res.status(400).send({ message: "Friend already added" });
        }

        user.friends.push({ friendId: friendId, status: "pending" });
        return user.save();
      })
      .then((updatedUser) => {
        res.send(updatedUser);
      })
      .catch((err) => {
        res.status(500).send({ message: `Error updating user with ID: ${id}` });
      });
  } else if (roomId) {
    People.findByIdAndUpdate(
      id,
      { $push: { rooms: req.body.roomId } },
      { new: true, runValidators: true }
    )
      .then((user) => {
        if (!user) {
          return res
            .status(404)
            .send({ message: `User not found with ID: ${id}` });
        }
        res.send(user);
      })
      .catch((err) => {
        res.status(500).send({ message: "Error updating user with room ID" });
      });
  } else if (serverId) {
    // Assuming you pass `serverId` in your request body
    People.findByIdAndUpdate(
      id,
      { $push: { servers: serverId } },
      { new: true }
    )
      .then((data) => {
        if (!data) {
          return res
            .status(404)
            .send({ message: `User not found with ID: ${id}` });
        }
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({ message: "Error updating user with server ID" });
      });
  } else {
    People.findByIdAndUpdate(id, updateData, { new: true })
      .then((data) => {
        if (!data) {
          return res
            .status(404)
            .send({ message: `User not found with ID: ${id}` });
        }
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({ message: "Error updating user information" });
      });
  }
};

// Delete a people thanks id

exports.delete = (req, res) => {
  const id = req.params.id;

  People.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `We can't delete people with ID : ${id}. Maybe it doesn't exist`,
        });
      } else {
        res
          .status(200)
          .send({ message: "People has been delete successfully" });
      }
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: `Error when deleting people with id : ${id}` });
    });
};

// login

exports.login = (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send({ message: "Email et Mot de passe requis" });
  }

  People.findOne({ email: req.body.email })
    .select("+password")
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "Utilisateur non trouvé" });
      }

      console.log("req.body.password:", req.body.password);
      console.log("user.password from DB:", user.password);

      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .send({ message: "Error with password comparison" });
        }

        if (!result) {
          return res.status(401).send({ message: "Mot de passe non correct" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        return res.send({
          token: token,
          user: {
            id: user._id,
            status: user.status,
          },
        });
      });
    })
    .catch((err) => {
      return res.status(500).send({ message: "Error during login" });
    });
};

exports.checkEmail = async (req, res) => {
  const email = req.query.email;
  const user = await People.findOne({ email: email });
  if (user) {
    res.json({ exists: true });
  } else {
    res.json({ exists: false });
  }
};
