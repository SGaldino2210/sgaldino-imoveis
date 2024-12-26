const express = require('express');
const cors = require('cors');
const path = require('path');
const { db, initDB } = require('./database');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Disponibilizar db para as rotas
app.locals.db = db;

// Inicializar banco de dados
initDB();

// Middleware para disponibilizar a chave do Google Maps
app.use((req, res, next) => {
    res.locals.GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    next();
});

// Rotas da API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/settings', require('./routes/settings'));

// Rota para o painel admin
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/index.html'));
});

// Rota para todas as outras requisições ao admin
app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/index.html'));
});

// Rota para página individual do imóvel
app.get('/imovel/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/property.html'));
});

// Rota para a landing page do imóvel
app.get('/imovel/:id/landing', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/landing.html'));
});

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Rota para capturar todas as outras requisições
app.get('*', (req, res) => {
    res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
}); 