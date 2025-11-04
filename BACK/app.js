const express = require('express');
const session = require('express-session');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

const path = require('path');

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

app.use(session({
    secret: "segredo-super-seguro",
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 1000 * 60 * 60,
        secure: false,
        httpOnly: true
    }
}));

const staticPath = path.join(__dirname, '..', 'FRONT');
app.use(express.static(staticPath));


console.log('Serving static files from:', staticPath);


const checkAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ erro: "Usuário não autenticado" });
    }
    next();
};

const checkAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.papel !== 'admin') {
        return res.status(403).json({ erro: "Acesso negado" });
    }
    next();
};

let usuarios = [
    { id: 1, nome: 'Admin', text: 'admin', senha: 'admin123', papel: 'admin' },
    { id: 2, nome: 'Usuário', text: 'usuario', senha: 'user123', papel: 'usuario' }
];
let proximoID = 3;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'FRONT', 'index.html'));
});


app.post("/api/login", (req, res) => {
    console.log('Requisição recebida:', req.body);
    const { text, senha } = req.body;
    if (!text || !senha) {
        console.log('Dados inválidos:', { text, senha }); 
        return res.status(400).json({ erro: 'Login e senha são obrigatórios' });
    }

    const user = usuarios.find(u => u.text === text && u.senha === senha);
    console.log('Usuário encontrado:', user ? 'sim' : 'não'); 

    if (!user) {
        return res.status(401).json({ erro: "Usuário ou senha incorretos" });
    }

    const { senha: _, ...userSemSenha } = user;
    user.sessionId = req.sessionID;
    req.session.user = userSemSenha;
    
    console.log('Login bem-sucedido para:', userSemSenha); 
    res.json({ 
        mensagem: "Login realizado com sucesso",
        usuario: userSemSenha
    });
});


app.get('/usuarios', checkAuth, (req, res) => {
    if (req.session.user.papel !== 'admin') {
        return res.json([req.session.user]);
    }
    const usuariosSemSenha = usuarios.map(({ senha: _, ...user }) => user);
    res.json(usuariosSemSenha);
});

app.get('/admin/usuarios', checkAdmin, (req, res) => {
    const usuariosSemSenha = usuarios.map(({ senha: _, ...user }) => user);
    res.json(usuariosSemSenha);
});

app.put('/admin/usuarios/:id/papel', checkAdmin, (req, res) => {
    const { id } = req.params;
    const { papel } = req.body;
    
    if (!papel || !['admin', 'usuario'].includes(papel)) {
        return res.status(400).json({ erro: "Papel inválido" });
    }

    const usuario = usuarios.find(u => u.id == id);
    if (!usuario) {
        return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    usuario.papel = papel;
    
    if (req.session.user && req.session.user.id == id) {
        req.session.user.papel = papel;
    }

    res.json({ mensagem: "Papel atualizado com sucesso", usuario: { ...usuario, senha: undefined } });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

let mensagens = [];

app.get("/api/mensagens", (req, res) => {
  res.json(mensagens);
});

app.post("/api/mensagens", (req, res) => {
  const { usuario, texto } = req.body;
  if (!usuario || !texto) {
    return res.status(400).json({ erro: "Dados incompletos" });
  }
  const novaMensagem = {
    usuario,
    texto,
    data: new Date().toLocaleString()
  };
  mensagens.push(novaMensagem);
  res.status(201).json({ mensagem: "Mensagem publicada", novaMensagem });
});


