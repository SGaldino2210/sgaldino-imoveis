const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Buscar configurações
router.get('/', auth, async (req, res) => {
    const db = req.app.locals.db;

    db.get('SELECT * FROM settings WHERE id = 1', [], (err, settings) => {
        if (err) {
            return res.status(500).json({ msg: 'Erro ao buscar configurações' });
        }
        res.json(settings || {});
    });
});

// Salvar configurações
router.post('/', auth, async (req, res) => {
    const db = req.app.locals.db;
    const settings = req.body;

    try {
        // Converter objeto de configurações para JSON
        const settingsJson = JSON.stringify(settings);

        db.run(`
            INSERT OR REPLACE INTO settings (id, data)
            VALUES (1, ?)
        `, [settingsJson], (err) => {
            if (err) {
                console.error('Erro ao salvar configurações:', err);
                return res.status(500).json({ msg: 'Erro ao salvar configurações' });
            }
            res.json({ msg: 'Configurações salvas com sucesso' });
        });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ msg: 'Erro ao processar configurações' });
    }
});

module.exports = router; 