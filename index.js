const express = require('express');
const multer = require('multer');
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

app.get('/login', (req, res) => {
    res.send('ladyxxa');
});

app.get('/zipper', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Zipper Form</title>
        </head>
        <body>
            <h2>Загрузка файла для GZIP-сжатия</h2>
            <form action="/zipper" method="POST" enctype="multipart/form-data">
                <input type="file" name="file" required>
                <button type="submit">Сжать файл</button>
            </form>
        </body>
        </html>
    `);
});

app.post('/zipper', upload.single('file'), (req, res) => {
    console.log('Request received');
    console.log('File:', req.file);
    
    if (!req.file) {
        console.log('No file in request');
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    try {
        const fileContent = fs.readFileSync(req.file.path);
        
        const compressed = zlib.gzipSync(fileContent);
        
        fs.unlinkSync(req.file.path);
        
        res.setHeader('Content-Type', 'application/gzip');
        res.setHeader('Content-Disposition', 'attachment; filename="result.gz"');
        res.send(compressed);
        
        console.log('File compressed and sent successfully');
        
    } catch (error) {
        console.error('Compression error:', error);
        
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({ error: 'Compression failed' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
