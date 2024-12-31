const ffmpeg = require('fluent-ffmpeg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do armazenamento para o multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads'); // Diretório de uploads
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Nome do arquivo permanece o mesmo
  }
});

// Criando a instância do multer com a configuração de armazenamento
const upload = multer({ storage: storage }).single('file');

// Rota para o processamento de vídeo
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

    const videoFile = req.file;
    const outputFile = path.join(__dirname, '..', 'uploads', 'compressed-' + videoFile.filename);

    // Usando ffmpeg para comprimir o vídeo
    ffmpeg()
      .input(videoFile.path) // Caminho do arquivo enviado
      .videoBitrate(1000) // Definir bitrate de vídeo
      .on('end', () => {
        // Após o processamento, enviar o arquivo comprimido para download
        res.download(outputFile, () => {
          // Excluir o arquivo comprimido após o download
          fs.unlinkSync(outputFile);
          fs.unlinkSync(videoFile.path); // Também excluir o arquivo original
        });
      })
      .on('error', (err) => {
        res.status(500).send('Erro ao processar o vídeo: ' + err.message);
      })
      .save(outputFile); // Salvar o arquivo comprimido no diretório de uploads
  });
};
