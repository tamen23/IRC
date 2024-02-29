let Message = require("../model/MessageModel");

// create and save message

exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "Content can't be empty !" });
    return;
  }

  // new people

  const message = new Message({
    sender: req.body.sender,
    receiver: req.body.receiver,
    content: req.body.content,
    type: req.body.content,
  });

  // save the message in the db

  message
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

// find and return all messages

exports.find = (req, res) => {
  Message.find()
    .then((message) => {
      res.send(message);
    })
    .catch((err) => {
      res
        .status(500)
        .send({
          message: err.message || "Error occured while finding all messages",
        });
    });
};

// find and return only one message

exports.findOne = (req, res) => {
  const id = req.params.id;

  Message.findById(id)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `We can't find the message with id ${id}. Maybe it doesn't exist`,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error when finding message information",
      });
    });
};

// Update a message thanks its id

exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: "Data to update can't be empty" });
  }

  const id = req.params.id;

  Message.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .send({
            message: `We can't update message with ID : ${id}. Maybe it doesn't exist`,
          });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: "Error when updating company informations" });
    });
};

// Delete a message thanks id

exports.delete = (req, res) => {
  const id = req.params.id;

  Message.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `We can't delete message with ID : ${id}. Maybe it doesn't exist`,
        });
      } else {
        res
          .status(200)
          .send({ message: "Message has been delete successfully" });
      }
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: `Error when deleting message with id : ${id}` });
    });
};
