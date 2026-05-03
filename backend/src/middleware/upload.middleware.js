const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { createCloudinaryStorage } = require('../config/cloudinary.config');

/**
 * Multer factory for file uploads.
 * Uses Cloudinary if credentials are provided, otherwise falls back to local disk storage.
 * @param {string} subfolder - e.g. 'ticket-show', 'events'
 * @param {object} [options]
 * @param {string[]} [options.allowedMimeTypes] - whitelist of mime types
 * @param {object} [options.limits] - multer limits (e.g. { fileSize: 5 * 1024 * 1024 })
 */
const createUpload = (subfolder, options = {}) => {
  const isCloudinaryEnabled = 
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET;

  let storage;

  if (isCloudinaryEnabled) {
    storage = createCloudinaryStorage(subfolder);
  } else {
    // Fallback to local storage
    const dest = path.join(__dirname, '..', 'uploads', subfolder);
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    storage = multer.diskStorage({
      destination: (req, file, cb) => cb(null, dest),
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '';
        const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
        cb(null, `${Date.now()}-${base}${ext}`);
      },
    });
  }

  const multerConfig = { storage };

  if (Array.isArray(options.allowedMimeTypes) && options.allowedMimeTypes.length > 0) {
    const allowed = new Set(options.allowedMimeTypes);
    multerConfig.fileFilter = (req, file, cb) => {
      if (allowed.has(file.mimetype)) {
        cb(null, true);
      } else {
        const err = new Error(`Unsupported file type: ${file.mimetype}`);
        err.statusCode = 400;
        cb(err);
      }
    };
  }

  if (options.limits) {
    multerConfig.limits = options.limits;
  }

  return multer(multerConfig);
};

module.exports = { createUpload };
