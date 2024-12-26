const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    try {
        console.log('Verificando autenticação');
        
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            console.log('Token não fornecido');
            return res.status(401).json({ error: 'Token não fornecido' });
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET não configurado');
            return res.status(500).json({ error: 'Erro de configuração do servidor' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        
        console.log('Autenticação bem-sucedida');
        next();
    } catch (error) {
        console.error('Erro de autenticação:', error);
        res.status(401).json({ error: 'Token inválido' });
    }
}; 