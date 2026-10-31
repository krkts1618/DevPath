import { prisma } from '../src/config/db.js';

async function main() {
  const roadmaps = await prisma.roadmap.count();
  const tasks = await prisma.task.count();
  const completions = await prisma.taskCompletion.count();
  const completedCompletions = await prisma.taskCompletion.count({ where: { completed: true } });
  const personalTasks = await prisma.personalTask.count();
  const completedPersonal = await prisma.personalTask.count({ where: { completed: true } });
  const sessions = await prisma.studySession.count();
  const revisions = await prisma.revisionSchedule.count();
  const revisionSessions = await prisma.revisionSession.count();
  const projects = await prisma.project.count();
  const milestones = await prisma.projectMilestone.count();
  const projectTasks = await prisma.projectTask.count();
  const notes = await prisma.note.count();
  const notifs = await prisma.notification.count();
  const restDays = await prisma.plannedRestDay.count();
  const streakConfigs = await prisma.streakTargetConfig.count();

  console.log('DB Counts:', {
    roadmaps,
    tasks,
    totalCompletions: completions,
    completedCompletions,
    totalPersonalTasks: personalTasks,
    completedPersonal,
    sessions,
    revisions,
    revisionSessions,
    projects,
    milestones,
    projectTasks,
    notes,
    notifs,
    restDays,
    streakConfigs,
  });

  const completionSamples = await prisma.taskCompletion.findMany({
    where: { completed: true },
    take: 10,
    orderBy: { completedAt: 'desc' },
    select: { id: true, taskId: true, completed: true, completedAt: true, notes: true },
  });
  console.log('Completed samples:', completionSamples);

  const sessionSamples = await prisma.studySession.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, status: true, actualDurationSeconds: true, startedAt: true },
  });
  console.log('Session samples:', sessionSamples);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
