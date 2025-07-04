// index.js
const express = require("express");
const exphbs = require("express-handlebars");
const connectDB = require("./config/db");
const usuarioRoutes = require("./routes/usuarioRoutes");
const Usuario = require("./models/Usuario");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require("connect-mongo");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const verificaAdmin = require("./middlewares/verificaAdmin");
const path = require("path"); // Adicionada esta linha para usar caminhos absolutos

const app = express();
console.log(">> MONGODB_URI RAW:", JSON.stringify(process.env.MONGODB_URI));

// Diagnóstico para verificar se as variáveis de ambiente estão disponíveis no Vercel
app.get("/debug-vercel", (req, res) => {
  res.json({
    mongodb_uri_env: process.env.MONGODB_URI || "NÃO DEFINIDA",
    session_secret_env: process.env.SESSION_SECRET || "NÃO DEFINIDA",
  });
});

// --- Configuração do Handlebars ---
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main",
    // Usando path.join para garantir caminhos absolutos no Vercel
    layoutsDir: path.join(__dirname, "views", "layouts"),
    partialsDir: path.join(__dirname, "views", "partials"),
  })
);
// Definindo a pasta de views com caminho absoluto
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // Linha corrigida para usar caminho absoluto
app.use(methodOverride("_method"));

// --- Configuração da Sessão ---
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Erro: A variável de ambiente MONGODB_URI não está definida!");
  process.exit(1);
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || "uma_chave_padrao_muito_insegura",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGODB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 dia
    },
  })
);

// --- Middleware para compartilhar sessão e usuário com templates ---
app.use(async (req, res, next) => {
  res.locals.req = req;

  if (req.session.userId) {
    try {
      const usuario = await Usuario.findById(req.session.userId)
        .select("-senha")
        .lean();

      if (usuario) {
        res.locals.usuario = usuario;
        res.locals.logado = true;
        res.locals.isAdmin = usuario.admin === true;
      } else {
        res.locals.usuario = null;
        res.locals.logado = false;
        res.locals.isAdmin = false;
      }
    } catch (error) {
      console.error("Erro ao carregar usuário da sessão:", error);
      res.locals.usuario = null;
      res.locals.logado = false;
      res.locals.isAdmin = false;
    }
  } else {
    res.locals.usuario = null;
    res.locals.logado = false;
    res.locals.isAdmin = false;
  }

  next();
});

// --- Conexão com o Banco de Dados ---
connectDB();

// --- Rotas da API ---
app.use("/api/usuarios", usuarioRoutes);

// --- Rotas para o Frontend (Handlebars) ---

app.get("/", (req, res) => {
  res.render("home", {
    pageTitle: "Bem-vindo ao Eventos Fam",
    message: "Eventos Contratados",
    logo: "/img/ana.jpg",
  });
});

app.get("/register", verificaAdmin, (req, res) => {
  res.render("register", {
    pageTitle: "Registrar Novo Usuário",
  });
});

app.get("/success", (req, res) => {
  res.render("success", {
    pageTitle: "Registro Concluído!",
    message: "Seu usuário foi registrado com sucesso!",
  });
});

app.get("/error", (req, res) => {
  res.render("error", {
    pageTitle: "Erro Ocorrido",
    errorMessage: "Desculpe, ocorreu um problema inesperado.",
  });
});

app.get("/usuarios", verificaAdmin, async (req, res) => {
  try {
    const usuarios = await Usuario.find().select("-senha").lean();
    res.render("userList", {
      pageTitle: "Lista de Usuários Cadastrados",
      usuarios: usuarios,
    });
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    res.render("error", {
      pageTitle: "Erro ao Carregar Usuários",
      errorMessage:
        "Não foi possível carregar a lista de usuários. Tente novamente mais tarde.",
    });
  }
});

app.get("/usuarios/editar/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id).lean();

    if (!usuario) {
      return res.status(404).render("error", {
        pageTitle: "Usuário Não Encontrado",
        errorMessage: "O usuário que você tentou editar não existe.",
      });
    }

    res.render("editUser", {
      pageTitle: "Editar Usuário",
      usuario: usuario,
    });
  } catch (error) {
    console.error("Erro ao carregar formulário de edição:", error);
    res.render("error", {
      pageTitle: "Erro ao Carregar Formulário",
      errorMessage:
        "Não foi possível carregar o formulário de edição. Verifique o ID.",
    });
  }
});

app.get("/login", (req, res) => {
  res.render("login", {
    pageTitle: "Login de Usuário",
  });
});

app.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    console.log("LOGIN_DEBUG: 1. Tentativa de login para email:", email); // DEBUG LOG

    if (!email || !senha) {
      console.log("LOGIN_DEBUG: 2. Email ou senha ausentes."); // DEBUG LOG
      return res.status(400).render("login", {
        pageTitle: "Login de Usuário",
        errorMessage: "Email e senha são obrigatórios.",
        oldInput: { email },
      });
    }

    const usuario = await Usuario.findOne({ email });
    console.log(
      "LOGIN_DEBUG: 3. Resultado findOne para email:",
      email,
      "Usuário encontrado:",
      !!usuario
    ); // DEBUG LOG

    if (!usuario) {
      console.log("LOGIN_DEBUG: 4. Usuário não encontrado."); // DEBUG LOG
      return res.status(401).render("login", {
        pageTitle: "Login de Usuário",
        errorMessage: "Email ou senha inválidos.",
        oldInput: { email },
      });
    }

    // Adicione um log para verificar se a senha do usuário existe antes de comparar
    console.log("LOGIN_DEBUG: 5. Usuario.senha existe:", !!usuario.senha); // DEBUG LOG

    const isMatch = await bcrypt.compare(senha, usuario.senha);
    console.log("LOGIN_DEBUG: 6. Resultado bcrypt.compare (isMatch):", isMatch); // DEBUG LOG

    if (!isMatch) {
      console.log("LOGIN_DEBUG: 7. Senha não corresponde."); // DEBUG LOG
      return res.status(401).render("login", {
        pageTitle: "Login de Usuário",
        errorMessage: "Email ou senha inválidos.",
        oldInput: { email },
      });
    }

    req.session.userId = usuario._id;
    req.session.isAuthenticated = true;
    console.log(
      "LOGIN_DEBUG: 8. Sessão definida para userId:",
      req.session.userId
    ); // DEBUG LOG

    res.redirect("/dashboard");
    console.log("LOGIN_DEBUG: 9. Redirecionando para dashboard."); // DEBUG LOG
  } catch (error) {
    console.error(
      "LOGIN_DEBUG: Erro CRÍTICO no processo de login (CATCH BLOCK):",
      error
    ); // DEBUG LOG (MUDEI A MENSAGEM)
    res.status(500).render("error", {
      pageTitle: "Erro de Login",
      errorMessage:
        "Ocorreu um erro interno do servidor ao tentar fazer login.",
    });
  }
});

app.get("/dashboard", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect(
      "/login?error=Você_precisa_estar_logado_para_acessar_esta_área."
    );
  }

  try {
    const usuario = await Usuario.findById(req.session.userId)
      .select("-senha")
      .lean();

    if (!usuario) {
      req.session.destroy(() => {
        res.redirect("/login?error=Sessão_inválida._Faça_o_login_novamente.");
      });
      return;
    }

    res.render("dashboard", {
      pageTitle: "Dashboard",
      usuario: usuario,
    });
  } catch (error) {
    console.error("Erro ao acessar dashboard:", error);
    res.status(500).render("error", {
      pageTitle: "Erro no Dashboard",
      errorMessage: "Não foi possível carregar o dashboard.",
    });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Erro ao fazer logout:", err);
      return res.status(500).redirect("/dashboard?error=Erro_ao_fazer_logout.");
    }
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});
app.post("/usuarios/:id/tornar-admin", verificaAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await Usuario.findByIdAndUpdate(id, { admin: true });
    res.redirect("/usuarios");
  } catch (err) {
    console.error("Erro ao tornar usuário admin:", err);
    res.status(500).render("error", {
      pageTitle: "Erro",
      errorMessage: "Não foi possível tornar o usuário administrador.",
    });
  }
});

// --- Iniciar o Servidor ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor Express rodando em http://localhost:${PORT}`);
});
