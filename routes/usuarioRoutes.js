const express = require("express");
const router = express.Router();
const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");

// --- Rota para CRIAR um novo usuário ---
router.post("/", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).render("register", {
        pageTitle: "Erro no Registro",
        errorMessage: "Todos os campos são obrigatórios.",
        oldInput: { nome, email },
      });
    }

    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(409).render("register", {
        pageTitle: "Erro no Registro",
        errorMessage: "Este email já está cadastrado.",
        oldInput: { nome, email },
      });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, salt);

    const novoUsuario = new Usuario({
      nome,
      email,
      senha: senhaCriptografada,
    });

    await novoUsuario.save();
    res.redirect("/success");
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    res.status(500).render("error", {
      pageTitle: "Erro Inesperado",
      errorMessage: "Ocorreu um erro ao tentar registrar o usuário.",
    });
  }
});

// --- Rota para LISTAR todos os usuários ---
router.get("/", async (req, res) => {
  try {
    const usuarios = await Usuario.find().select("-senha");
    res.json(usuarios);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).send("Erro interno do servidor.");
  }
});

// --- Rota para ATUALIZAR um usuário ---
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, senha, idade } = req.body;

    let usuarioAtualizado = { nome, email, idade };

    if (!nome || !email) {
      return res.redirect(
        `/usuarios/editar/${id}?error=Campos_Nome_e_Email_são_obrigatórios.`
      );
    }

    const usuarioComEmailExistente = await Usuario.findOne({ email });
    if (
      usuarioComEmailExistente &&
      usuarioComEmailExistente._id.toString() !== id
    ) {
      return res.redirect(
        `/usuarios/editar/${id}?error=Este_email_já_está_cadastrado_para_outro_usuário.`
      );
    }

    if (senha) {
      const salt = await bcrypt.genSalt(10);
      usuarioAtualizado.senha = await bcrypt.hash(senha, salt);
    }

    const result = await Usuario.findByIdAndUpdate(id, usuarioAtualizado, {
      new: true,
      runValidators: true,
    });

    if (!result) {
      return res
        .status(404)
        .redirect(`/usuarios?error=Usuário_não_encontrado_para_atualização.`);
    }

    res.redirect("/usuarios?success=Usuário_atualizado_com_sucesso!");
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res
      .status(500)
      .redirect(`/usuarios?error=Erro_interno_do_servidor_ao_atualizar.`);
  }
});

// --- Rota para DELETAR um usuário ---
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Usuario.findByIdAndDelete(id);

    if (!result) {
      return res
        .status(404)
        .redirect("/usuarios?error=Usuário_não_encontrado_para_exclusão.");
    }

    res.redirect("/usuarios?success=Usuário_excluído_com_sucesso!");
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    res
      .status(500)
      .redirect("/usuarios?error=Erro_interno_do_servidor_ao_excluir.");
  }
});

module.exports = router;
