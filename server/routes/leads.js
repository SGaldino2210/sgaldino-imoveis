const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Obter todos os leads
router.get('/', auth, async (req, res) => {
    const db = req.app.locals.db;
    
    db.all(`
        SELECT l.*, p.title as property_title 
        FROM leads l
        LEFT JOIN properties p ON l.property_id = p.id
        ORDER BY l.created_at DESC
    `, [], (err, leads) => {
        if (err) {
            console.error('Erro ao buscar leads:', err);
            return res.status(500).json({ msg: 'Erro ao buscar leads' });
        }
        res.json(leads);
    });
});

// Criar novo lead
router.post('/', async (req, res) => {
    const db = req.app.locals.db;
    const { name, email, phone, property_id, message } = req.body;

    db.run(`
        INSERT INTO leads (name, email, phone, property_id, message)
        VALUES (?, ?, ?, ?, ?)
    `, [name, email, phone, property_id, message], function(err) {
        if (err) {
            console.error('Erro ao criar lead:', err);
            return res.status(500).json({ msg: 'Erro ao salvar lead' });
        }
        res.status(201).json({ 
            msg: 'Lead criado com sucesso',
            id: this.lastID 
        });
    });
});

module.exports = router; 