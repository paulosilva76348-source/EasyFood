const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");

const UPLOAD_ROOT = path.join(__dirname, "../../../public/uploads");
const MAX_EDGE = 1280;

function fail(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function removeImage(imageUrl) {
  if (typeof imageUrl !== "string" || !imageUrl.startsWith("/uploads/")) return;
  const relative = imageUrl.slice("/uploads/".length);
  if (!relative || relative.includes("..") || relative.includes("\\")) return;

  const root = path.resolve(UPLOAD_ROOT);
  const full = path.resolve(UPLOAD_ROOT, relative);
  if (full !== root && !full.startsWith(root + path.sep)) return;

  fs.unlink(full, () => {});
}

async function saveImage(buffer, folder) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw fail("Envie uma imagem no campo image");
  }
  if (folder !== "dishes" && folder !== "profiles" && folder !== "restaurants") {
    throw fail("Destino de imagem inválido");
  }

  let metadata;
  try {
    metadata = await sharp(buffer, { failOn: "error" }).metadata();
  } catch (cause) {
    const error = fail("Não foi possível processar a imagem");
    error.cause = cause;
    throw error;
  }

  const format = metadata.format;
  if (format !== "jpeg" && format !== "png" && format !== "webp") {
    throw fail("Envie uma imagem JPG, PNG ou WEBP");
  }

  const extension = format === "jpeg" ? ".jpg" : format === "png" ? ".png" : ".webp";
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extension}`;
  const directory = path.join(UPLOAD_ROOT, folder);
  const fullPath = path.join(directory, filename);
  fs.mkdirSync(directory, { recursive: true });

  try {
    let image = sharp(buffer, { failOn: "error" })
      .rotate()
      .resize({
        width: MAX_EDGE,
        height: MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true
      });

    if (format === "jpeg") image = image.jpeg({ quality: 80, mozjpeg: true });
    else if (format === "png") image = image.png({ compressionLevel: 8 });
    else image = image.webp({ quality: 80 });

    await image.toFile(fullPath);
  } catch (cause) {
    fs.unlink(fullPath, () => {});
    const error = fail("Não foi possível processar a imagem");
    error.cause = cause;
    throw error;
  }

  return `/uploads/${folder}/${filename}`;
}

module.exports = {
  saveImage,
  removeImage
};
