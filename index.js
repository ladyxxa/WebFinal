const express = require('express');
const multer = require('multer');
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

app.get('/login', (req, res) => {
    res.send('ladyxxa');
});

app.get('/zipper', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <title>Zipper Form</title>
        </head>
        <body>
            <h2>Загрузка файла для GZIP-сжатия</h2>
            <form action="/zipper" method="post" enctype="multipart/form-data">
                <input type="file" name="file" required>
                <button type="submit">Сжать файл</button>
            </form>
        </body>
        </html>
    `);
});

app.post('/zipper', upload.single('file'), (req, res) => {
    console.log('Получен файл:', req.file); // Для отладки
    
    if (!req.file) {
        return res.status(400).send('Файл не был загружен');
    }

    const inputFile = req.file.path;
    const outputFile = inputFile + '.gz';

    try {
        const fileContent = fs.readFileSync(inputFile);
        const compressed = zlib.gzipSync(fileContent);
        
        fs.unlinkSync(inputFile);
        
        res.setHeader('Content-Type', 'application/gzip');
        res.setHeader('Content-Disposition', 'attachment; filename="result.gz"');
        res.send(compressed);
        
    } catch (error) {
        console.error('Ошибка при сжатии:', error);
        res.status(500).send('Ошибка при сжатии файла');
        
        if (fs.existsSync(inputFile)) {
            fs.unlinkSync(inputFile);
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
