const express = require('express');
const session = require('express-session');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

const path = require('path');
app.use(express.static(path.join(__dirname, '..', 'FRONT')));

app.use(cors({ credentials: true }));
app.use(express.json());

app.use(session({
    secret: "segredo-super-seguro",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 } // 1 hora
}));

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

app.post("/login", (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ erro: 'Campo login (text) é obrigatório' });

    const user = usuarios.find(u => u.text === text);

    if (!user) {
        return res.status(401).json({ erro: "Usuário não cadastrado" });
    }

    const { senha: _, ...userSemSenha } = user;
    user.sessionId = req.sessionID;
    req.session.user = userSemSenha;
    res.json({ 
        mensagem: "Login realizado com sucesso",
        usuario: userSemSenha
    });
});

app.post('/admin/derrubar/:id', checkAdmin, (req, res) => {
    const { id } = req.params;
    const usuario = usuarios.find(u => u.id == id);
    if (!usuario || !usuario.sessionId) {
        return res.status(404).json({ erro: 'Sessão do usuário não encontrada' });
    }

    req.sessionStore.destroy(usuario.sessionId, (err) => {
        if (err) return res.status(500).json({ erro: 'Erro ao derrubar sessão' });
        delete usuario.sessionId;
        res.json({ mensagem: 'Sessão derrubada com sucesso' });
    });
});

app.post('/admin/derrubar-todas', checkAdmin, (req, res) => {
    const ids = usuarios.map(u => u.sessionId).filter(Boolean);
    let erro = null;
    let pending = ids.length;
    if (pending === 0) return res.json({ mensagem: 'Nenhuma sessão ativa encontrada' });

    ids.forEach(sid => {
        req.sessionStore.destroy(sid, (err) => {
            if (err) erro = err;
            pending -= 1;
            if (pending === 0) {
                // remove sessionId de todos os usuários
                usuarios.forEach(u => delete u.sessionId);
                if (erro) return res.status(500).json({ erro: 'Erro ao derrubar algumas sessões' });
                res.json({ mensagem: 'Todas as sessões foram derrubadas' });
            }
        });
    });
});

app.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ mensagem: "Logout realizado com sucesso" });
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
