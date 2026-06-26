const express = require("express");
const multer = require("multer");
const zlib = require("zlib");

const app = express();

const upload = multer({
  storage: multer.memoryStorage()
});


app.get("/login", (req, res) => {
  res.type("text/plain");
  res.send("ladyxxa");
});

app.post("/zipper", upload.single("file"), (req, res) => {

  if (!req.file) {
    return res.status(400).send("No file");
  }

  zlib.gzip(req.file.buffer, (err, result) => {

    if (err) {
      return res.status(500).send("Compression error");
    }

    res.setHeader("Content-Type", "application/gzip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${req.file.originalname}.gz"`
    );

    res.send(result);
  });

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
});
