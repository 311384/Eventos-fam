// models/Usuario.js
const mongoose = require("mongoose");

const UsuarioSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true, // Remove espaços em branco antes e depois do nome
  },
  email: {
    type: String,
    required: true,
    unique: true, // Garante que cada email seja único
    trim: true, // Remove espaços em branco
    lowercase: true, // Converte o email para minúsculas
  },
  senha: {
    // <-- NOVO CAMPO: Para armazenar a senha criptografada
    type: String,
    required: true,
    minlength: 6, // Opcional: define um tamanho mínimo para a senha
  },
  admin: {
    type: Boolean,
    default: false, // Por padrão, todos os usuários são comuns
  },

  idade: {
    type: Number,
  },
  dataCadastro: {
    type: Date,
    default: Date.now,
  },
  ultimaAtualizacao: {
    type: Date,
    default: Date.now,
  },
});

// Atualiza 'ultimaAtualizacao' antes de salvar (para updates também)
UsuarioSchema.pre("save", function (next) {
  this.ultimaAtualizacao = new Date();
  next();
});

// Exporta o modelo para ser usado em outros arquivos
module.exports = mongoose.model("Usuario", UsuarioSchema);
