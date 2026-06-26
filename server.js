const express = require("express");
const multer = require("multer");
const zlib = require("zlib");

const app = express();

const upload = multer({
  storage: multer.memoryStorage()
});

app.get("/login", (req, res) => {
  res.type("text/plain").send("ladyxxa");
});


app.get("/zipper", (req, res) => {
  res.status(200).send("OK");
});

app.post("/zipper", upload.any(), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("No file");
  }

  zlib.gzip(req.files[0].buffer, (err, gz) => {
    if (err) {
      return res.sendStatus(500);
    }

    res.status(200);
    res.set("Content-Type", "application/gzip");
    res.end(gz);
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
