const path = require('path');
const multer = require('multer');
const fs = require('fs');

/**
 * Multer factory for Phase 2 file uploads.
 * @param {string} subfolder - e.g. 'ticket-show', 'events' (under src/uploads)
 */
const createUpload = (subfolder) => {
  const dest = path.join(__dirname, '..', 'uploads', subfolder);
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || '';
      const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
      cb(null, `${Date.now()}-${base}${ext}`);
    },
  });

  return multer({ storage });
};

module.exports = { createUpload };
