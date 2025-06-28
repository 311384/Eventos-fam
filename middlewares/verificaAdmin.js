// middlewares/verificaAdmin.js
const Usuario = require("../models/Usuario");

module.exports = async function (req, res, next) {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(403).render("error", {
        pageTitle: "Acesso Negado",
        errorMessage: "Você precisa estar logado para acessar esta área.",
      });
    }

    const usuario = await Usuario.findById(userId);
    if (!usuario || !usuario.admin) {
      return res.status(403).render("error", {
        pageTitle: "Acesso Restrito",
        errorMessage: "Apenas administradores podem acessar esta página.",
      });
    }

    req.usuario = usuario;
    next();
  } catch (err) {
    console.error("Erro no middleware de admin:", err);
    res.status(500).render("error", {
      pageTitle: "Erro no Acesso",
      errorMessage: "Erro ao verificar permissões de administrador.",
    });
  }
};
