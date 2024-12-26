const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Listar imóveis
router.get('/', auth, async (req, res) => {
    const db = req.app.locals.db;
    
    try {
        console.log('Iniciando busca de imóveis');
        
        // Verificar se o banco de dados está disponível
        if (!db) {
            console.error('Banco de dados não disponível');
            return res.status(500).json({ error: 'Erro de conexão com o banco de dados' });
        }

        // Primeiro, verificar se a tabela existe
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='properties'", [], (err, table) => {
            if (err) {
                console.error('Erro ao verificar tabela:', err);
                return res.status(500).json({ error: 'Erro ao verificar estrutura do banco' });
            }
            
            if (!table) {
                console.error('Tabela properties não existe');
                return res.status(500).json({ error: 'Tabela não encontrada' });
            }
            
            // Buscar propriedades
            db.all(`
                SELECT 
                    p.*,
                    GROUP_CONCAT(i.url) as image_urls
                FROM properties p
                LEFT JOIN images i ON p.id = i.property_id
                GROUP BY p.id
                ORDER BY p.created_at DESC
            `, [], async (err, rows) => {
                if (err) {
                    console.error('Erro ao buscar propriedades:', err);
                    return res.status(500).json({ error: 'Erro ao buscar propriedades' });
                }

                try {
                    // Processar os resultados
                    const properties = rows.map(row => {
                        const images = row.image_urls ? row.image_urls.split(',') : [];
                        delete row.image_urls;
                        
                        return {
                            ...row,
                            images,
                            amenities: row.amenities ? JSON.parse(row.amenities) : []
                        };
                    });

                    console.log(`Encontrados ${properties.length} imóveis`);
                    res.json(properties);
                    
                } catch (parseError) {
                    console.error('Erro ao processar dados:', parseError);
                    res.status(500).json({ error: 'Erro ao processar dados dos imóveis' });
                }
            });
        });

    } catch (error) {
        console.error('Erro geral ao buscar imóveis:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router; 