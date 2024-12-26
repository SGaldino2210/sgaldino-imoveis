const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        cb(null, 'upload-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

router.post('/images', auth, upload.array('images', 10), (req, res) => {
    try {
        const files = req.files.map(file => ({
            url: `/uploads/${file.filename}`,
            alt: file.originalname
        }));
        
        res.json({ success: true, files });
    } catch (error) {
        console.error('Erro no upload:', error);
        res.status(500).json({ success: false, message: 'Erro no upload' });
    }
});

module.exports = router; 