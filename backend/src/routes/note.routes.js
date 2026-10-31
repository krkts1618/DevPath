import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { NoteController } from '../controllers/note.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../../uploads/notes');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${Date.now()}-${basename}${ext}`);
  },
});

const allowedMimeTypes = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/json',
];

const allowedExtensions = [
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.svg',
  '.pdf',
  '.txt',
  '.md',
  '.json',
];

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max file size
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isMimeValid = allowedMimeTypes.includes(file.mimetype);
    const isExtValid = allowedExtensions.includes(ext);

    if (isMimeValid && isExtValid) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type (${file.mimetype}, ext: ${ext}). Supported types: images, PDF, text, markdown, JSON.`
        )
      );
    }
  },
});

const router = Router();

// Tags CRUD
router.get('/tags', NoteController.getTags);
router.post('/tags', NoteController.createTag);
router.delete('/tags/:id', NoteController.deleteTag);

// Notes CRUD & operations
router.get('/', NoteController.getNotes);
router.post('/', NoteController.create);
router.get('/:id', NoteController.getById);
router.put('/:id', NoteController.update);
router.delete('/:id', NoteController.delete);
router.post('/:id/duplicate', NoteController.duplicate);
router.patch('/:id/pin', NoteController.togglePin);
router.patch('/:id/favorite', NoteController.toggleFavorite);
router.patch('/:id/archive', NoteController.toggleArchive);

// Attachments
router.post('/:id/attachments', upload.single('file'), NoteController.uploadAttachment);
router.delete('/:noteId/attachments/:attachmentId', NoteController.deleteAttachment);

export default router;
