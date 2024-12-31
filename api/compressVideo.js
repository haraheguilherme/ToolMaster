// /api/compressVideo.js
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

module.exports = (req, res) => {
  const videoFile = req.body.file; // O arquivo de vídeo enviado

  if (!videoFile) {
    return res.status(400).send("Por favor, envie um arquivo de vídeo.");
  }

  const outputFile = '/tmp/compressed-video.mp4';

  ffmpeg()
    .input(videoFile.buffer)
    .videoBitrate(1000)  // Define a taxa de compressão do vídeo
    .on('end', () => {
      // Após a compressão, o arquivo é enviado para download
      res.download(outputFile, () => {
        fs.unlinkSync(outputFile);  // Apaga o arquivo após o download
      });
    })
    .on('error', (err) => {
      // Caso haja erro no processo
      res.status(500).send('Erro ao processar o vídeo: ' + err.message);
    })
    .save(outputFile);  // Salva o vídeo comprimido no arquivo temporário
};
