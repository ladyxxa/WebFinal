const express = require('express');
const multer = require('multer');
const zlib = require('zlib');
const fs = require('fs');

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
    if (!req.file) {
        return res.status(400).send('Файл не был загружен');
    }

    const inputFile = req.file.path;
    const outputFile = inputFile + '.gz';

    const gzip = zlib.createGzip();
    const input = fs.createReadStream(inputFile);
    const output = fs.createWriteStream(outputFile);

    input.pipe(gzip).pipe(output);

    output.on('finish', () => {
        res.download(outputFile, 'result.gz', (err) => {
            if (err) {
                console.error('Ошибка при отправке файла:', err);
            }
            fs.unlink(inputFile, () => {});
            fs.unlink(outputFile, () => {});
        });
    });

    output.on('error', (err) => {
        console.error('Ошибка при сжатии:', err);
        res.status(500).send('Ошибка при сжатии файла');
        fs.unlink(inputFile, () => {});
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
