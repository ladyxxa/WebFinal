const express = require('express');
const cors = require('cors');
const zlib = require('zlib');
const { Readable } = require('stream');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

function compressStream(inputBuffer) {
  return new Promise((resolve, reject) => {
    const gzipStream = zlib.createGzip();
    const chunks = [];
    
    gzipStream.on('data', (chunk) => chunks.push(chunk));
    gzipStream.on('end', () => resolve(Buffer.concat(chunks)));
    gzipStream.on('error', reject);
    
    const readableStream = new Readable();
    readableStream.push(inputBuffer);
    readableStream.push(null);
    
    readableStream.pipe(gzipStream);
  });
}

app.get('/login', (request, response) => {
  response.type('text/plain');
  response.send('ladyxxa');
});

function parseIncomingData(req) {
  return new Promise((resolve) => {
    const contentType = req.headers['content-type'] || '';
    
    if (contentType.includes('multipart/form-data')) {

      const boundary = contentType.split('boundary=')[1];
      const dataParts = [];
      
      req.on('data', (part) => dataParts.push(part));
      req.on('end', () => {
        const fullData = Buffer.concat(dataParts);
        const str = fullData.toString();
        
        const headerEnd = str.indexOf('\r\n\r\n');
        if (headerEnd === -1) {
          resolve(fullData);
          return;
        }
        
        let contentStart = headerEnd + 4;
        const endBoundary = str.lastIndexOf('--' + boundary + '--');
        
        if (endBoundary !== -1) {
          const fileData = fullData.slice(contentStart, endBoundary - 2);
          resolve(fileData);
        } else {
          resolve(fullData.slice(contentStart));
        }
      });
    } else {
  
      const parts = [];
      req.on('data', (part) => parts.push(part));
      req.on('end', () => resolve(Buffer.concat(parts)));
    }
  });
}

app.post('/zipper', async (req, res) => {
  try {
    const inputData = await parseIncomingData(req);
    
    if (!inputData || inputData.length === 0) {
      return res.status(400).send('Empty data');
    }
    
    const compressed = await compressStream(inputData);
    
    res.writeHead(200, {
      'Content-Type': 'application/gzip',
      'Content-Disposition': 'attachment; filename=result.gz',
      'Content-Length': compressed.length
    });
    
    res.end(compressed);
    
  } catch (error) {
    console.error('Compression failed:', error);
    res.status(500).send('Compression error');
  }
});

app.get('/zipper', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>File Compressor</title>
    </head>
    <body>
      <h2>GZIP Compression Service</h2>
      <form action="/zipper" method="post" enctype="multipart/form-data">
        <input type="file" name="file">
        <button type="submit">Compress File</button>
      </form>
    </body>
    </html>
  `);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const serverPort = process.env.PORT || 3000;
app.listen(serverPort, () => {
  console.log(`Compression service running on port ${serverPort}`);
});
