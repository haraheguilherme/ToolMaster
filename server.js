const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Criação do diretório de uploads se não existir
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Rota para upload e compressão de vídeo
app.post('/compress-video', upload.single('video'), (req, res) => {
  const inputFile = req.file.path;
  const outputFile = 'uploads/compressed-' + req.file.filename;

  ffmpeg(inputFile)
    .videoBitrate(1000)  // Configuração para taxa de bits (1 Mbps)
    .on('end', () => {
      res.download(outputFile, (err) => {
        if (err) {
          console.log("Erro ao enviar arquivo", err);
        }
        fs.unlinkSync(inputFile);
        fs.unlinkSync(outputFile);
      });
    })
    .on('error', (err) => {
      console.log("Erro na compressão de vídeo:", err);
      res.status(500).send("Erro na compressão do vídeo");
    })
    .save(outputFile);
});

// Rota para upload e compressão de áudio
app.post('/compress-audio', upload.single('audio'), (req, res) => {
  const inputFile = req.file.path;
  const outputFile = 'uploads/compressed-' + req.file.filename;

  ffmpeg(inputFile)
    .audioBitrate(128)  // Configuração para taxa de bits do áudio (128 kbps)
    .on('end', () => {
      res.download(outputFile, (err) => {
        if (err) {
          console.log("Erro ao enviar arquivo", err);
        }
        fs.unlinkSync(inputFile);
        fs.unlinkSync(outputFile);
      });
    })
    .on('error', (err) => {
      console.log("Erro na compressão de áudio:", err);
      res.status(500).send("Erro na compressão do áudio");
    })
    .save(outputFile);
});

// Servindo o frontend
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
