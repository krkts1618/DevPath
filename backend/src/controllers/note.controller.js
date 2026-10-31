import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { NoteService } from '../services/note.service.js';
import { successResponse, errorResponse } from '../utils/response.util.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads/notes');

// Ensure upload directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const NoteController = {
  async getNotes(req, res, next) {
    try {
      const {
        search,
        roadmapId,
        categoryId,
        tagId,
        isPinned,
        isFavorite,
        isArchived,
        sort,
        order,
        page,
        limit,
      } = req.query;

      const result = await NoteService.getNotes(
        { search, roadmapId, categoryId, tagId, isPinned, isFavorite, isArchived, sort, order },
        { page, limit }
      );

      return successResponse(res, result, 'Notes retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const note = await NoteService.getNoteById(req.params.id);
      return successResponse(res, note, 'Note retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const note = await NoteService.createNote(req.body);
      return successResponse(res, note, 'Note created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const note = await NoteService.updateNote(req.params.id, req.body);
      return successResponse(res, note, 'Note updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const result = await NoteService.deleteNote(req.params.id);
      return successResponse(res, result, 'Note deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async duplicate(req, res, next) {
    try {
      const note = await NoteService.duplicateNote(req.params.id);
      return successResponse(res, note, 'Note duplicated successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async togglePin(req, res, next) {
    try {
      const note = await NoteService.togglePin(req.params.id);
      return successResponse(res, note, `Note ${note.isPinned ? 'pinned' : 'unpinned'} successfully`);
    } catch (error) {
      next(error);
    }
  },

  async toggleFavorite(req, res, next) {
    try {
      const note = await NoteService.toggleFavorite(req.params.id);
      return successResponse(res, note, `Note ${note.isFavorite ? 'marked as favorite' : 'removed from favorites'}`);
    } catch (error) {
      next(error);
    }
  },

  async toggleArchive(req, res, next) {
    try {
      const note = await NoteService.toggleArchive(req.params.id);
      return successResponse(res, note, `Note ${note.isArchived ? 'archived' : 'restored'} successfully`);
    } catch (error) {
      next(error);
    }
  },

  async getTags(req, res, next) {
    try {
      const tags = await NoteService.getTags();
      return successResponse(res, tags, 'Tags retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async createTag(req, res, next) {
    try {
      const tag = await NoteService.createTag(req.body);
      return successResponse(res, tag, 'Tag created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async deleteTag(req, res, next) {
    try {
      await NoteService.deleteTag(req.params.id);
      return successResponse(res, null, 'Tag deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async uploadAttachment(req, res, next) {
    try {
      if (!req.file) {
        return errorResponse(res, 'No file provided or invalid file format', 400);
      }

      const noteId = req.params.id;
      const file = req.file;

      const attachment = await NoteService.addAttachment(noteId, {
        fileName: file.originalname,
        fileUrl: `/uploads/notes/${file.filename}`,
        fileType: file.mimetype,
        fileSize: file.size,
        storageKey: file.path,
      });

      return successResponse(
        res,
        {
          ...attachment,
          storageProvider: 'local-secure',
          message: 'Attachment stored securely with PostgreSQL tracking',
        },
        'File uploaded and attached successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  },

  async deleteAttachment(req, res, next) {
    try {
      const { noteId, attachmentId } = req.params;
      const result = await NoteService.deleteAttachment(noteId, attachmentId);
      return successResponse(res, result, 'Attachment deleted successfully');
    } catch (error) {
      next(error);
    }
  },
};
