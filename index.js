const express = require('express');
const multer = require('multer');
const zlib = require('zlib');

const app = express();

const storage = multer.memoryStorage();
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
            <title>Zipper</title>
        </head>
        <body>
            <form action="/zipper" method="post" enctype="multipart/form-data">
                <input type="file" name="file">
                <button type="submit">Submit</button>
            </form>
        </body>
        </html>
    `);
});

app.post('/zipper', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file');
    }
    
    const compressed = zlib.gzipSync(req.file.buffer);
    
    res.set({
        'Content-Type': 'application/gzip',
        'Content-Disposition': 'attachment; filename="result.gz"'
    });
    
    res.send(compressed);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server started on port', PORT);
});
