// config/db.js
require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // essas opções não são mais necessárias no Mongoose 6+
      // useFindAndModify: false,
      // useCreateIndex: true,
    });
    console.log("Conectado ao MongoDB com sucesso!");
  } catch (err) {
    console.error("Erro ao conectar com o MongoDB:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
