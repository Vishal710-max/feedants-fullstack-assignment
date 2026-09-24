const fs = require('fs');
const path = require('path');
const multer = require('multer');
const config = require('../config/env');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(config.uploadDir, 'submissions', String(req.competition._id));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});

module.exports = multer({
  storage,
  limits: { fileSize: config.maxUploadMB * 1024 * 1024, files: 1 },
});
