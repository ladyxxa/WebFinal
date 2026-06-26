const express = require('express');
const multer = require('multer');
const zlib = require('zlib');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.get('/login', (req, res) => {
    res.send('ladyxxa');
});

app.get('/zipper', (req, res) => {
    res.sendFile(path.join(__dirname, 'zipper_form.html'));
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
