const Server = require("../model/ServerModel");

// Create a server
exports.create = async (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "Content can't be empty !" });
    return;
  }

  // new room

  const server = new Server({
    name: req.body.name,
    description: req.body.description,
    owner: req.body.owner,
    members: req.body.members,
  });

  // save the room in the db

  server
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
};

// Get all servers
exports.find = async (req, res) => {
  try {
    const servers = await Server.find({}).populate("channels");
    res.send(servers);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Get a server by ID
exports.findOne = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id).populate("channels");
    if (!server) {
      return res.status(404).send();
    }
    res.send(server);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Update a server
exports.update = async (req, res) => {
  try {
    const channelIdToAdd = req.body.newChannelId;
    const server = await Server.findByIdAndUpdate(
      req.params.id,
      {
        $push: { channels: channelIdToAdd },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!server) {
      return res.status(404).send();
    }
    res.send(server);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Delete a server
exports.delete = async (req, res) => {
  try {
    const server = await Server.findByIdAndDelete(req.params.id);
    if (!server) {
      return res.status(404).send();
    }
    res.send(server);
  } catch (error) {
    res.status(500).send(error);
  }
};
