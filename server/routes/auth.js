const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const db = req.app.locals.db;

    try {
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
            if (err) {
                console.error('Erro ao buscar usuário:', err);
                return res.status(500).json({ msg: 'Erro ao buscar usuário' });
            }

            if (!user) {
                return res.status(401).json({ msg: 'Usuário não encontrado' });
            }

            if (password !== user.password) { // Em produção, usar bcrypt
                return res.status(401).json({ msg: 'Senha incorreta' });
            }

            const token = jwt.sign(
                { user: { id: user.id, role: user.role } },
                process.env.JWT_SECRET || 'sua_chave_secreta',
                { expiresIn: '24h' }
            );

            res.json({ token });
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ msg: 'Erro interno no servidor' });
    }
});

module.exports = router; 