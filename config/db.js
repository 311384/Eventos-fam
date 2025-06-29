// config/db.js
require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || !uri.startsWith("mongodb")) {
    console.error("❌ MONGODB_URI inválida ou não definida:");
    console.error("Valor atual:", JSON.stringify(uri));
    process.exit(1); // Encerra o processo para evitar falhas em cadeia
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Conectado ao MongoDB com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao conectar com o MongoDB:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
