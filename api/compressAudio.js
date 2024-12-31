const ffmpeg = require('fluent-ffmpeg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do multer para upload de áudio (usando memória para arquivos temporários)
const storage = multer.memoryStorage(); // Armazenamento em memória
const upload = multer({ storage: storage }).single('file'); // Middleware de upload

// Rota para o processamento de áudio
module.exports = (req, res) => {
  // Chamar o middleware de upload do multer
  upload(req, res, function (err) {
    if (err) {
      return res.status(500).send("Erro ao fazer upload do arquivo.");
    }

    // Garantir que um arquivo tenha sido enviado
    if (!req.file) {
      return res.status(400).send("Nenhum arquivo foi enviado.");
    }

    const audioFile = req.file;
    const outputFile = path.join(__dirname, '..', 'uploads', 'compressed-' + audioFile.originalname);

    // Usando ffmpeg para comprimir o áudio
    ffmpeg()
      .input(audioFile.buffer) // Buffer de áudio do multer
      .audioBitrate(128) // Definir bitrate de áudio
      .on('end', () => {
        // Após o processamento, enviar o arquivo comprimido para download
        res.download(outputFile, () => {
          // Excluir o arquivo comprimido após o download
          fs.unlinkSync(outputFile);
        });
      })
      .on('error', (err) => {
        res.status(500).send('Erro ao processar o áudio: ' + err.message);
      })
      .save(outputFile); // Salvar o arquivo comprimido no diretório de uploads
  });
};
