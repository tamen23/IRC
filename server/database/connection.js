const mongoose = require("mongoose");

const connectDB = async () => {
  mongoose.set("strictQuery", false);

  try {
    const con = await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB connect : ${con.connection.host}`);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

module.exports = connectDB;
