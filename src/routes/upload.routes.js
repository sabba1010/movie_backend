const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype.startsWith('image/') || 
            file.mimetype.startsWith('audio/') || 
            file.mimetype.startsWith('video/') || 
            file.mimetype.startsWith('application/') || 
            file.mimetype.startsWith('text/')
        ) {
            cb(null, true);
        } else {
            cb(new Error('File type not supported'));
        }
    }
});

// Upload route
router.post('/', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file provided' });
    }
    
    // Return the URL where the file can be accessed
    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ success: true, url: fileUrl });
});

module.exports = router;
