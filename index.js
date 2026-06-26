const express = require('express');
const cors = require('cors');
const multer = require('multer');
const zlib = require('zlib');

const app = express();

app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 
    }
});

app.get('/login', (req, res) => {
    res.type('text/plain');
    res.send('ladyxxa');
});


app.post('/zipper', (req, res) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(400).send('Upload error');
        }

        if (!req.file) {
            if (req.body && Object.keys(req.body).length > 0) {
                const data = Buffer.from(Object.values(req.body)[0]);
                const compressed = zlib.gzipSync(data);
                res.setHeader('Content-Type', 'application/gzip');
                return res.end(compressed);
            }
            return res.status(400).send('No data provided');
        }

        try {
            const compressed = zlib.gzipSync(req.file.buffer);
            
            res.setHeader('Content-Type', 'application/gzip');
            res.setHeader('Content-Disposition', 'attachment; filename="result.gz"');
            res.end(compressed);
            
        } catch (error) {
            console.error('Compression error:', error);
            res.status(500).send('Compression failed');
        }
    });
});

app.get('/zipper', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Zipper Test</title>
        </head>
        <body>
            <form action="/zipper" method="post" enctype="multipart/form-data">
                <input type="file" name="file">
                <button type="submit">Upload & Compress</button>
            </form>
        </body>
        </html>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
