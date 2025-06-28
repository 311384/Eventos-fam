// controllers/usuarioController.js
const Usuario = require('../models/Usuario');

// Função para criar um novo usuário
exports.criarUsuario = async (nome, email, idade) => {
    try {
        const novoUsuario = new Usuario({ nome, email, idade });
        await novoUsuario.save();
        console.log("Usuário criado com sucesso:", novoUsuario);
        return novoUsuario;
    } catch (err) {
        console.error("Erro ao cadastrar usuário:", err.message);
        throw err; // Lança o erro para ser capturado no index.js
    }
};

// Função para buscar todos os usuários
exports.buscarTodosUsuarios = async () => {
    try {
        const usuarios = await Usuario.find({});
        console.log("Usuários encontrados:", usuarios);
        return usuarios;
    } catch (err) {
        console.error("Erro ao buscar usuários:", err.message);
        throw err;
    }
};

// Função para buscar um usuário por ID
exports.buscarUsuarioPorId = async (id) => {
    try {
        const usuario = await Usuario.findById(id);
        if (!usuario) {
            console.log("Usuário não encontrado.");
            return null;
        }
        console.log("Usuário encontrado por ID:", usuario);
        return usuario;
    } catch (err) {
        console.error("Erro ao buscar usuário por ID:", err.message);
        throw err;
    }
};

// Função para buscar um usuário por email (adicionada para evitar duplicatas)
exports.buscarUsuarioPorEmail = async (email) => {
    try {
        const usuario = await Usuario.findOne({ email: email });
        return usuario; // Retorna o usuário ou null se não encontrado
    } catch (err) {
        console.error("Erro ao buscar usuário por email:", err.message);
        throw err;
    }
};

// Função para atualizar um usuário
exports.atualizarUsuario = async (id, dadosAtualizados) => {
    try {
        // Assegura que ultimaAtualizacao seja definida automaticamente via middleware no Schema,
        // ou defina aqui se não estiver usando o middleware 'pre('save')' no modelo.
        // Se já tem no schema com 'pre('save')', não precisa disso aqui:
        // dadosAtualizados.ultimaAtualizacao = new Date();

        const usuarioAtualizado = await Usuario.findByIdAndUpdate(
            id,
            { $set: dadosAtualizados }, // Usa $set para atualizar apenas os campos fornecidos
            { new: true, runValidators: true } // Retorna o doc atualizado e roda validadores
        );
        if (!usuarioAtualizado) {
            console.log("Usuário não encontrado para atualização.");
            return null;
        }
        console.log("Usuário atualizado com sucesso:", usuarioAtualizado);
        return usuarioAtualizado;
    } catch (err) {
        console.error("Erro ao atualizar usuário:", err.message);
        throw err;
    }
};

// Função para deletar um usuário
exports.deletarUsuario = async (id) => {
    try {
        const usuarioDeletado = await Usuario.findByIdAndDelete(id);
        if (!usuarioDeletado) {
            console.log("Usuário não encontrado para exclusão.");
            return null;
        }
        console.log("Usuário deletado com sucesso:", usuarioDeletado);
        return usuarioDeletado;
    } catch (err) {
        console.error("Erro ao deletar usuário:", err.message);
        throw err;
    }
};