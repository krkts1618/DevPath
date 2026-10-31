import { prisma } from '../config/db.js';
import { getKolkataDateString } from '../utils/date.util.js';

export const NoteService = {
  /**
   * Get all notes with filters and pagination
   */
  async getNotes(filters = {}, pagination = { page: 1, limit: 12 }) {
    const page = Math.max(1, parseInt(pagination.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(pagination.limit, 10) || 12));
    const skip = (page - 1) * limit;

    const {
      search,
      roadmapId,
      categoryId,
      tagId,
      isPinned,
      isFavorite,
      isArchived,
      sort = 'updatedAt',
      order = 'desc',
    } = filters;

    const where = {};

    // Archive filter: default to non-archived unless explicitly asked
    if (isArchived !== undefined && isArchived !== '') {
      where.isArchived = isArchived === 'true' || isArchived === true;
    } else {
      where.isArchived = false;
    }

    if (isPinned !== undefined && isPinned !== '') {
      where.isPinned = isPinned === 'true' || isPinned === true;
    }

    if (isFavorite !== undefined && isFavorite !== '') {
      where.isFavorite = isFavorite === 'true' || isFavorite === true;
    }

    if (roadmapId) {
      where.roadmapId = roadmapId;
    }

    if (categoryId) {
      where.roadmap = {
        categoryId,
      };
    }

    if (tagId) {
      where.tags = {
        some: {
          tagId,
        },
      };
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
        { roadmap: { title: { contains: q, mode: 'insensitive' } } },
        { tags: { some: { tag: { name: { contains: q, mode: 'insensitive' } } } } },
      ];
    }

    // Determine sort ordering
    const orderBy = [];
    if (where.isPinned === undefined) {
      orderBy.push({ isPinned: 'desc' });
    }
    const sortField = ['title', 'createdAt', 'updatedAt'].includes(sort) ? sort : 'updatedAt';
    const sortDirection = order?.toLowerCase() === 'asc' ? 'asc' : 'desc';
    orderBy.push({ [sortField]: sortDirection });

    const [totalCount, notes] = await Promise.all([
      prisma.note.count({ where }),
      prisma.note.findMany({
        where,
        include: {
          roadmap: {
            select: { id: true, title: true, categoryId: true, category: { select: { id: true, name: true } } },
          },
          roadmapDay: {
            select: { id: true, dayNumber: true, title: true },
          },
          task: {
            select: { id: true, title: true, taskType: true },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          attachments: {
            select: { id: true, fileName: true, fileType: true, fileSize: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    // Format preview content snippet
    const formattedNotes = notes.map((n) => {
      // Strip markdown syntax for preview
      const plainText = (n.content || '')
        .replace(/#+\s+/g, '')
        .replace(/```[\s\S]*?```/g, '[Code Snippet]')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .trim();

      const previewSnippet = plainText.slice(0, 160) + (plainText.length > 160 ? '...' : '');

      return {
        id: n.id,
        title: n.title,
        content: n.content,
        previewSnippet,
        isPinned: n.isPinned,
        isFavorite: n.isFavorite,
        isArchived: n.isArchived,
        roadmapId: n.roadmapId,
        roadmapTitle: n.roadmap?.title || null,
        categoryId: n.roadmap?.categoryId || null,
        categoryName: n.roadmap?.category?.name || null,
        roadmapDayId: n.roadmapDayId,
        dayNumber: n.roadmapDay?.dayNumber || null,
        dayTitle: n.roadmapDay?.title || null,
        taskId: n.taskId,
        taskTitle: n.task?.title || null,
        tags: n.tags.map((t) => ({ id: t.tag.id, name: t.tag.name, color: t.tag.color })),
        attachmentsCount: n.attachments.length,
        attachments: n.attachments,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
      };
    });

    return {
      notes: formattedNotes,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    };
  },

  /**
   * Get a single note by ID with full details
   */
  async getNoteById(id) {
    const note = await prisma.note.findUnique({
      where: { id },
      include: {
        roadmap: {
          select: { id: true, title: true, categoryId: true, category: { select: { id: true, name: true } } },
        },
        roadmapDay: {
          select: { id: true, dayNumber: true, title: true },
        },
        task: {
          select: { id: true, title: true, taskType: true },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        attachments: true,
      },
    });

    if (!note) {
      throw new Error('Note not found');
    }

    return {
      ...note,
      tags: note.tags.map((t) => ({ id: t.tag.id, name: t.tag.name, color: t.tag.color })),
    };
  },

  /**
   * Create a new note
   */
  async createNote(data) {
    const {
      title,
      content = '',
      roadmapId = null,
      roadmapDayId = null,
      taskId = null,
      isPinned = false,
      isFavorite = false,
      tagIds = [],
      tagNames = [],
    } = data;

    if (!title || !title.trim()) {
      throw new Error('Note title is required');
    }

    // Process tag IDs and names
    const resolvedTagIds = new Set(tagIds.filter(Boolean));

    if (tagNames && tagNames.length > 0) {
      for (const name of tagNames) {
        if (!name || !name.trim()) continue;
        const normalized = name.trim().toLowerCase();
        const existing = await prisma.noteTag.upsert({
          where: { name: normalized },
          update: {},
          create: { name: normalized },
        });
        resolvedTagIds.add(existing.id);
      }
    }

    const note = await prisma.note.create({
      data: {
        title: title.trim(),
        content: content || '',
        roadmapId: roadmapId || null,
        roadmapDayId: roadmapDayId || null,
        taskId: taskId || null,
        isPinned: Boolean(isPinned),
        isFavorite: Boolean(isFavorite),
        tags: {
          create: Array.from(resolvedTagIds).map((tagId) => ({
            tag: { connect: { id: tagId } },
          })),
        },
      },
      include: {
        roadmap: { select: { id: true, title: true } },
        roadmapDay: { select: { id: true, dayNumber: true, title: true } },
        task: { select: { id: true, title: true } },
        tags: { include: { tag: true } },
        attachments: true,
      },
    });

    return {
      ...note,
      tags: note.tags.map((t) => ({ id: t.tag.id, name: t.tag.name, color: t.tag.color })),
    };
  },

  /**
   * Update an existing note (supports autosave)
   */
  async updateNote(id, data) {
    const existing = await prisma.note.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Note not found');
    }

    const {
      title,
      content,
      roadmapId,
      roadmapDayId,
      taskId,
      isPinned,
      isFavorite,
      isArchived,
      tagIds,
      tagNames,
    } = data;

    const updatePayload = {};

    if (title !== undefined) updatePayload.title = title.trim();
    if (content !== undefined) updatePayload.content = content;
    if (roadmapId !== undefined) updatePayload.roadmapId = roadmapId || null;
    if (roadmapDayId !== undefined) updatePayload.roadmapDayId = roadmapDayId || null;
    if (taskId !== undefined) updatePayload.taskId = taskId || null;
    if (isPinned !== undefined) updatePayload.isPinned = Boolean(isPinned);
    if (isFavorite !== undefined) updatePayload.isFavorite = Boolean(isFavorite);
    if (isArchived !== undefined) updatePayload.isArchived = Boolean(isArchived);

    // Update tags if provided
    if (tagIds !== undefined || tagNames !== undefined) {
      const resolvedTagIds = new Set((tagIds || []).filter(Boolean));

      if (tagNames && tagNames.length > 0) {
        for (const name of tagNames) {
          if (!name || !name.trim()) continue;
          const normalized = name.trim().toLowerCase();
          const tag = await prisma.noteTag.upsert({
            where: { name: normalized },
            update: {},
            create: { name: normalized },
          });
          resolvedTagIds.add(tag.id);
        }
      }

      // Remove existing mappings and re-insert
      await prisma.noteTagMapping.deleteMany({ where: { noteId: id } });
      updatePayload.tags = {
        create: Array.from(resolvedTagIds).map((tId) => ({
          tag: { connect: { id: tId } },
        })),
      };
    }

    const updated = await prisma.note.update({
      where: { id },
      data: updatePayload,
      include: {
        roadmap: { select: { id: true, title: true } },
        roadmapDay: { select: { id: true, dayNumber: true, title: true } },
        task: { select: { id: true, title: true } },
        tags: { include: { tag: true } },
        attachments: true,
      },
    });

    return {
      ...updated,
      tags: updated.tags.map((t) => ({ id: t.tag.id, name: t.tag.name, color: t.tag.color })),
    };
  },

  /**
   * Duplicate a note
   */
  async duplicateNote(id) {
    const original = await this.getNoteById(id);
    const newTitle = `${original.title} (Copy)`;

    return this.createNote({
      title: newTitle,
      content: original.content,
      roadmapId: original.roadmapId,
      roadmapDayId: original.roadmapDayId,
      taskId: original.taskId,
      isPinned: false,
      isFavorite: false,
      tagIds: original.tags.map((t) => t.id),
    });
  },

  /**
   * Delete a note (safely without deleting roadmap or task data)
   */
  async deleteNote(id) {
    const existing = await prisma.note.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Note not found');
    }
    return prisma.note.delete({
      where: { id },
    });
  },

  /**
   * Toggle pinned status
   */
  async togglePin(id) {
    const existing = await prisma.note.findUnique({ where: { id } });
    if (!existing) throw new Error('Note not found');
    return prisma.note.update({
      where: { id },
      data: { isPinned: !existing.isPinned },
    });
  },

  /**
   * Toggle favorite status
   */
  async toggleFavorite(id) {
    const existing = await prisma.note.findUnique({ where: { id } });
    if (!existing) throw new Error('Note not found');
    return prisma.note.update({
      where: { id },
      data: { isFavorite: !existing.isFavorite },
    });
  },

  /**
   * Toggle archive status
   */
  async toggleArchive(id) {
    const existing = await prisma.note.findUnique({ where: { id } });
    if (!existing) throw new Error('Note not found');
    return prisma.note.update({
      where: { id },
      data: { isArchived: !existing.isArchived },
    });
  },

  /**
   * Archive / restore note
   */
  async setArchived(id, isArchived) {
    const existing = await prisma.note.findUnique({ where: { id } });
    if (!existing) throw new Error('Note not found');
    return prisma.note.update({
      where: { id },
      data: { isArchived: Boolean(isArchived) },
    });
  },

  /**
   * Tags Management
   */
  async getTags() {
    return this.getAllTags();
  },

  async getAllTags() {
    const tags = await prisma.noteTag.findMany({
      include: {
        _count: {
          select: { notes: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return tags.map((t) => ({
      id: t.id,
      name: t.name,
      color: t.color,
      notesCount: t._count.notes,
    }));
  },

  async createTag(name, color = null) {
    if (!name || !name.trim()) throw new Error('Tag name is required');
    return prisma.noteTag.create({
      data: {
        name: name.trim().toLowerCase(),
        color,
      },
    });
  },

  async updateTag(id, name, color = null) {
    return prisma.noteTag.update({
      where: { id },
      data: {
        ...(name && { name: name.trim().toLowerCase() }),
        ...(color !== undefined && { color }),
      },
    });
  },

  async deleteTag(id) {
    return prisma.noteTag.delete({
      where: { id },
    });
  },

  /**
   * Attachments Management
   */
  async addAttachment(noteId, fileData) {
    const { fileName, fileUrl, fileType, fileSize } = fileData;
    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note) throw new Error('Note not found');

    return prisma.noteAttachment.create({
      data: {
        noteId,
        fileName,
        fileUrl,
        fileType,
        fileSize,
      },
    });
  },

  async deleteAttachment(attachmentId) {
    const attachment = await prisma.noteAttachment.findUnique({
      where: { id: attachmentId },
    });
    if (!attachment) throw new Error('Attachment not found');

    await prisma.noteAttachment.delete({
      where: { id: attachmentId },
    });

    return attachment;
  },
};
