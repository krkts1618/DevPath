import { prisma } from '../config/db.js';

export const CategoryRepository = {
  async findAll({ status = 'all' } = {}) {
    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    return prisma.roadmapCategory.findMany({
      where,
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { roadmaps: true },
        },
        roadmaps: {
          select: {
            id: true,
            title: true,
            slug: true,
            duration: true,
            status: true,
            iconIdentifier: true,
            themeIdentifier: true,
            targetDailyStudyTime: true,
            startDate: true,
            displayOrder: true,
          },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  },

  async findById(id) {
    return prisma.roadmapCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { roadmaps: true },
        },
        roadmaps: {
          orderBy: { displayOrder: 'asc' },
          select: {
            id: true,
            title: true,
            slug: true,
            duration: true,
            status: true,
            iconIdentifier: true,
            themeIdentifier: true,
            targetDailyStudyTime: true,
            startDate: true,
            displayOrder: true,
          },
        },
      },
    });
  },

  async findByName(name) {
    return prisma.roadmapCategory.findUnique({
      where: { name },
    });
  },

  async findBySlug(slug) {
    return prisma.roadmapCategory.findUnique({
      where: { slug },
    });
  },

  async create(data) {
    return prisma.roadmapCategory.create({
      data: {
        ...data,
        status: data.status || 'active',
      },
      include: {
        _count: {
          select: { roadmaps: true },
        },
      },
    });
  },

  async update(id, data) {
    return prisma.roadmapCategory.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { roadmaps: true },
        },
      },
    });
  },

  async archive(id, targetCategoryId = null) {
    return prisma.$transaction(
      async (tx) => {
        // If targetCategoryId provided, reassign roadmaps
        if (targetCategoryId) {
          await tx.roadmap.updateMany({
            where: { categoryId: id },
            data: { categoryId: targetCategoryId },
          });
        }

        return tx.roadmapCategory.update({
          where: { id },
          data: { status: 'archived' },
        });
      },
      { maxWait: 20000, timeout: 30000 }
    );
  },

  async restore(id) {
    return prisma.roadmapCategory.update({
      where: { id },
      data: { status: 'active' },
    });
  },

  async reorder(items) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.roadmapCategory.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        })
      )
    );
  },

  async delete(id) {
    return prisma.roadmapCategory.delete({
      where: { id },
    });
  },

  async deleteWithCascade(id) {
    return prisma.$transaction(
      async (tx) => {
        const roadmaps = await tx.roadmap.findMany({
          where: { categoryId: id },
          select: { id: true },
        });
        for (const r of roadmaps) {
          await tx.roadmap.delete({ where: { id: r.id } });
        }
        return tx.roadmapCategory.delete({ where: { id } });
      },
      { maxWait: 20000, timeout: 30000 }
    );
  },
};
