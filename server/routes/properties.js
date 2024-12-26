const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configuração do Multer
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        cb(null, 'property-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Criar imóvel
router.post('/', auth, async (req, res) => {
    const {
        title, description, price, type, location,
        latitude, longitude, area, bedrooms,
        bathrooms, suites, parking, amenities
    } = req.body;

    const db = req.app.locals.db;

    try {
        db.run(`
            INSERT INTO properties (
                title, description, price, type, location,
                latitude, longitude, area, bedrooms,
                bathrooms, suites, parking, amenities
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            title, description, price, type, location,
            latitude, longitude, area, bedrooms,
            bathrooms, suites, parking, amenities
        ], function(err) {
            if (err) {
                console.error('Erro ao salvar imóvel:', err);
                return res.status(500).json({ msg: 'Erro ao salvar imóvel' });
            }
            res.status(201).json({ 
                msg: 'Imóvel salvo com sucesso',
                id: this.lastID 
            });
        });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ msg: 'Erro interno do servidor' });
    }
});

// Listar imóveis
router.get('/', async (req, res) => {
    const db = req.app.locals.db;
    
    try {
        const properties = await new Promise((resolve, reject) => {
            db.all(`
                SELECT p.*, GROUP_CONCAT(i.url) as images
                FROM properties p
                LEFT JOIN images i ON p.id = i.property_id
                GROUP BY p.id
                ORDER BY p.created_at DESC
            `, [], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        res.json(properties);
    } catch (error) {
        console.error('Erro ao buscar imóveis:', error);
        res.status(500).json({ error: 'Erro ao buscar imóveis' });
    }
});

// Atualizar imóvel
router.put('/:id', auth, async (req, res) => {
    const db = req.app.locals.db;
    const { 
        title, description, price, type, location,
        area, bedrooms, bathrooms, parking 
    } = req.body;

    try {
        db.run(`
            UPDATE properties
            SET title = ?, description = ?, price = ?,
                type = ?, location = ?, area = ?,
                bedrooms = ?, bathrooms = ?, parking = ?
            WHERE id = ?
        `, [
            title, description, price, type, location,
            area, bedrooms, bathrooms, parking, req.params.id
        ], (err) => {
            if (err) {
                console.error('Erro ao atualizar imóvel:', err);
                return res.status(500).json({ msg: 'Erro ao atualizar imóvel' });
            }
            res.json({ msg: 'Imóvel atualizado com sucesso' });
        });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ msg: 'Erro interno no servidor' });
    }
});

// Buscar imóvel específico
router.get('/:id', async (req, res) => {
    const db = req.app.locals.db;
    const id = req.params.id;
    
    try {
        const property = await new Promise((resolve, reject) => {
            db.get(`
                SELECT p.*, GROUP_CONCAT(i.url) as images,
                       GROUP_CONCAT(DISTINCT i.id) as image_ids
                FROM properties p
                LEFT JOIN images i ON p.id = i.property_id
                WHERE p.id = ?
                GROUP BY p.id
            `, [id], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        if (!property) {
            return res.status(404).json({ error: 'Imóvel não encontrado' });
        }

        // Formatar os dados antes de enviar
        if (property.images) {
            property.images = property.images.split(',');
        }
        if (property.image_ids) {
            property.image_ids = property.image_ids.split(',').map(Number);
        }
        if (property.amenities) {
            try {
                property.amenities = JSON.parse(property.amenities);
            } catch (e) {
                property.amenities = [];
            }
        }

        res.json(property);
    } catch (error) {
        console.error('Erro ao buscar imóvel:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router; 