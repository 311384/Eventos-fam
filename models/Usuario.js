const mongoose = require("mongoose");

// --- 1. Definição do esquema para um único comentário ---
const comentarioSchema = new mongoose.Schema({
  texto: {
    type: String,
    required: true,
  },
  data: {
    type: Date,
    default: Date.now,
  },
  // Opcional: Se quiser referenciar o autor do comentário (o ID do usuário que postou)
  // autor: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'Usuario' // Isso cria uma referência ao próprio modelo de Usuário
  // }
});

// --- 2. Definição do esquema do Usuário (com o novo campo 'comentarios') ---
const UsuarioSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  senha: {
    type: String,
    required: true,
    minlength: 6,
  },
  admin: {
    type: Boolean,
    default: false,
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
  // --- NOVO CAMPO ADICIONADO PARA COMENTÁRIOS ---
  comentarios: {
    type: [comentarioSchema], // Isso diz ao Mongoose que 'comentarios' será um array de objetos que seguem o 'comentarioSchema'
    default: [], // Inicializa como um array vazio por padrão, para evitar 'undefined'
  },
});

// Atualiza 'ultimaAtualizacao' antes de salvar (para updates também)
UsuarioSchema.pre("save", function (next) {
  this.ultimaAtualizacao = new Date();
  next();
});

// Exporta o modelo para ser usado em outros arquivos
module.exports = mongoose.model("Usuario", UsuarioSchema);
