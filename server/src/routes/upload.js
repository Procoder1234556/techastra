import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { config } from '../config.js';

const uploadDir = config.uploadDir;

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /^image\/(jpeg|png|webp|gif)|application\/pdf$/;
    if (allowed.test(file.mimetype)) cb(null, true);
    else cb(new Error('File type not allowed'));
  },
});

const router = Router();

async function recordUpload(req, file, kind) {
  const publicUrl = `${config.apiPublicUrl}/uploads/${file.filename}`;
  const { rows } = await query(
    `INSERT INTO techastra_uploads (user_id, kind, original_name, mime_type, size_bytes, public_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [req.session.userId, kind, file.originalname, file.mimetype, file.size, publicUrl],
  );
  return {
    _id: rows[0].id,
    url: publicUrl,
    originalName: file.originalname,
    mimeType: file.mimetype,
    sizeBytes: file.size,
  };
}

router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  try {
    const meta = await recordUpload(req, req.file, req.body.kind || 'file');
    res.status(201).json(meta);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/banner', requireAuth, upload.single('banner'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No banner uploaded' });
  try {
    const meta = await recordUpload(req, req.file, 'event_banner');
    res.status(201).json(meta);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
