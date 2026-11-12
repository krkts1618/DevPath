import { prisma } from '../config/db.js';

export const RoadmapRepository = {
  async findAll({ categoryId, status, search, sortBy = 'default', page = 1, limit = 50, summaryOnly = false }) {
    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (status && status !== 'all') where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy = [{ displayOrder: 'asc' }, { createdAt: 'desc' }];
    if (sortBy === 'name') {
      orderBy = [{ title: 'asc' }];
    } else if (sortBy === 'createdAt') {
      orderBy = [{ createdAt: 'desc' }];
    } else if (sortBy === 'startDate') {
      orderBy = [{ startDate: 'asc' }, { title: 'asc' }];
    } else if (sortBy === 'duration') {
      orderBy = [{ duration: 'asc' }];
    }

    const skip = (page - 1) * limit;

    // Fast path for sidebar navigation and lightweight selectors
    if (summaryOnly) {
      const [total, roadmaps] = await Promise.all([
        prisma.roadmap.count({ where }),
        prisma.roadmap.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          select: {
            id: true,
            title: true,
            slug: true,
            categoryId: true,
            status: true,
            duration: true,
            displayOrder: true,
            iconIdentifier: true,
            themeIdentifier: true,
            category: {
              select: { id: true, name: true, slug: true },
            },
          },
        }),
      ]);
      return {
        roadmaps,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit) || 1,
        },
      };
    }

    const [total, rawRoadmaps, taskAgg, compAgg] = await Promise.all([
      prisma.roadmap.count({ where }),
      prisma.roadmap.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          _count: {
            select: {
              modules: true,
              roadmapDays: true,
              projects: true,
            },
          },
        },
      }),
      prisma.$queryRaw`
        SELECT rd.roadmap_id, COUNT(t.id)::int as total_tasks
        FROM roadmap_days rd
        JOIN tasks t ON t.roadmap_day_id = rd.id
        GROUP BY rd.roadmap_id
      `,
      prisma.$queryRaw`
        SELECT rd.roadmap_id, COUNT(DISTINCT tc.task_id)::int as completed_tasks
        FROM roadmap_days rd
        JOIN tasks t ON t.roadmap_day_id = rd.id
        JOIN task_completions tc ON tc.task_id = t.id AND tc.completed = true
        GROUP BY rd.roadmap_id
      `,
    ]);

    const totalMap = new Map(taskAgg.map((row) => [row.roadmap_id, row.total_tasks]));
    const compMap = new Map(compAgg.map((row) => [row.roadmap_id, row.completed_tasks]));

    // Calculate aggregated metrics for each roadmap efficiently
    const roadmaps = rawRoadmaps.map((r) => {
      const totalTasks = totalMap.get(r.id) || 0;
      const completedTasks = compMap.get(r.id) || 0;
      const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...r,
        modulesCount: r._count.modules,
        daysCount: r._count.roadmapDays,
        totalTasks,
        completedTasks,
        progressPercent,
      };
    });

    // If sorting by progress in JavaScript
    if (sortBy === 'progress') {
      roadmaps.sort((a, b) => b.progressPercent - a.progressPercent);
    }

    return { total, roadmaps };
  },

  async findSummaryById(id) {
    const rows = await prisma.$queryRaw`
      SELECT 
        json_build_object(
          'id', r.id,
          'title', r.title,
          'slug', r.slug,
          'description', r.description,
          'duration', r.duration,
          'targetDailyStudyTime', r.target_daily_study_time,
          'startDate', r.start_date,
          'status', r.status,
          'displayOrder', r.display_order,
          'iconIdentifier', r.icon_identifier,
          'themeIdentifier', r.theme_identifier,
          'createdAt', r.created_at,
          'updatedAt', r.updated_at,
          'category', json_build_object('id', c.id, 'name', c.name, 'slug', c.slug)
        ) as roadmap,
        (
          SELECT COALESCE(json_agg(json_build_object(
            'id', m.id,
            'roadmapId', m.roadmap_id,
            'title', m.title,
            'description', m.description,
            'startingDay', m.starting_day,
            'endingDay', m.ending_day,
            'displayOrder', m.display_order
          ) ORDER BY m.display_order ASC, m.starting_day ASC), '[]'::json)
          FROM modules m
          WHERE m.roadmap_id = r.id
        ) as modules,
        (
          SELECT COALESCE(json_agg(json_build_object(
            'id', rd.id,
            'roadmapId', rd.roadmap_id,
            'moduleId', rd.module_id,
            'dayNumber', rd.day_number,
            'title', rd.title,
            'objective', rd.objective,
            'estimatedStudyTime', rd.estimated_study_time,
            'dayType', rd.day_type,
            'totalTasksCount', COALESCE(t_agg.total_tasks, 0),
            'completedTasksCount', COALESCE(t_agg.completed_tasks, 0),
            'isDayCompleted', CASE WHEN COALESCE(t_agg.total_tasks, 0) > 0 THEN COALESCE(t_agg.completed_tasks, 0) = t_agg.total_tasks ELSE true END
          ) ORDER BY rd.day_number ASC), '[]'::json)
          FROM roadmap_days rd
          LEFT JOIN (
            SELECT 
              t.roadmap_day_id,
              COUNT(t.id)::int as total_tasks,
              COUNT(DISTINCT CASE WHEN tc.completed = true THEN tc.task_id END)::int as completed_tasks
            FROM tasks t
            LEFT JOIN task_completions tc ON tc.task_id = t.id AND tc.completed = true
            GROUP BY t.roadmap_day_id
          ) t_agg ON t_agg.roadmap_day_id = rd.id
          WHERE rd.roadmap_id = r.id
        ) as days
      FROM roadmaps r
      JOIN roadmap_categories c ON c.id = r.category_id
      WHERE r.id = ${id}::uuid
    `;

    if (!rows || rows.length === 0) return null;
    const row = rows[0];
    return {
      ...row.roadmap,
      modules: row.modules || [],
      roadmapDays: row.days || [],
    };
  },

  async findById(id) {
    return prisma.roadmap.findUnique({
      where: { id },
      include: {
        category: true,
        modules: {
          orderBy: [{ displayOrder: 'asc' }, { startingDay: 'asc' }],
        },
        roadmapDays: {
          orderBy: { dayNumber: 'asc' },
          include: {
            tasks: {
              orderBy: { displayOrder: 'asc' },
              include: {
                completions: true,
                reassignments: {
                  include: {
                    originalDay: { select: { dayNumber: true, title: true } },
                    newDay: { select: { dayNumber: true, title: true } },
                  },
                },
              },
            },
          },
        },
        projects: true,
        _count: {
          select: {
            modules: true,
            roadmapDays: true,
            projects: true,
            dailyNotes: true,
          },
        },
      },
    });
  },

  async findBasicById(id) {
    return prisma.roadmap.findUnique({
      where: { id },
      select: { id: true, status: true, title: true, categoryId: true, startDate: true, duration: true },
    });
  },

  async findBySlug(slug) {
    return prisma.roadmap.findUnique({
      where: { slug },
      include: {
        category: true,
        modules: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  },

  async create(data) {
    return prisma.roadmap.create({
      data,
      include: {
        category: true,
      },
    });
  },

  async update(id, data) {
    return prisma.roadmap.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  },

  async archive(id) {
    return prisma.roadmap.update({
      where: { id },
      data: { status: 'archived' },
      include: {
        category: true,
      },
    });
  },

  async restore(id) {
    return prisma.roadmap.update({
      where: { id },
      data: { status: 'active' },
      include: {
        category: true,
      },
    });
  },

  async delete(id) {
    return prisma.roadmap.delete({
      where: { id },
    });
  },

  async permanentDelete(id) {
    return prisma.roadmap.delete({
      where: { id },
    });
  },
};
