require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const Usuario = require("./models/Usuario");

const criarAdmin = async () => {
  try {
    await connectDB();

    const email = process.env.ADMIN_EMAIL;
    const senha = process.env.ADMIN_PASSWORD;

    if (!email || !senha) {
      console.error("ADMIN_EMAIL ou ADMIN_PASSWORD não estão definidos.");
      process.exit(1);
    }

    const existente = await Usuario.findOne({ email });
    if (existente) {
      console.log("Usuário admin já existe.");
      process.exit();
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const novoAdmin = new Usuario({
      nome: "Administrador",
      email,
      senha: senhaCriptografada,
      idade: 99,
      admin: true,
    });

    await novoAdmin.save();
    console.log("Usuário admin criado com sucesso!");
    console.log(`Email: ${email}`);
    console.log(`Senha: definida via .env`);
    process.exit();
  } catch (err) {
    console.error("Erro ao criar admin:", err);
    process.exit(1);
  }
};

criarAdmin();
