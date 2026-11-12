const multer = require("multer");

const MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED = {
  "image/jpeg": true,
  "image/png": true,
  "image/webp": true
};

function looksLikeImage(buffer) {
  if (!buffer || buffer.length < 12) return false;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return true;
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return true;
  return false;
}

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED[file.mimetype]) {
      const error = new Error("Envie uma imagem JPG, PNG ou WEBP");
      error.statusCode = 400;
      return cb(error);
    }
    cb(null, true);
  }
});

function uploadSingle(req, res, next) {
  imageUpload.single("image")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "A imagem deve ter no máximo 5 MB" });
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({ error: "Envie o arquivo no campo image" });
      }
      const status = err.statusCode || 400;
      return res.status(status).json({
        error: err.message || "Não foi possível receber a imagem"
      });
    }

    if (!req.file || !looksLikeImage(req.file.buffer)) {
      req.file = undefined;
      return res.status(400).json({ error: "O arquivo enviado não é uma imagem válida" });
    }

    next();
  });
}

module.exports = { uploadSingle };
