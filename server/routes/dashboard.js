const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/stats', async (req, res) => {
    try {
        // Total de imóveis
        const totalImoveis = await db.get('SELECT COUNT(*) as total FROM imoveis');
        
        // Total de leads
        const totalLeads = await db.get('SELECT COUNT(*) as total FROM leads');
        
        // Visitas do mês
        const visitasMes = await db.get(`
            SELECT COUNT(*) as total 
            FROM visitas 
            WHERE strftime('%Y-%m', data) = strftime('%Y-%m', 'now')
        `);
        
        // Leads por mês
        const leadsPorMes = await db.all(`
            SELECT 
                strftime('%m/%Y', data_cadastro) as mes,
                COUNT(*) as total
            FROM leads
            GROUP BY strftime('%Y-%m', data_cadastro)
            ORDER BY data_cadastro DESC
            LIMIT 6
        `);
        
        res.json({
            totalImoveis: totalImoveis.total,
            totalLeads: totalLeads.total,
            visitasMes: visitasMes.total,
            leadsPorMes
        });
        
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
});

module.exports = router; 