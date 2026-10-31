import { prisma } from '../src/config/db.js';

async function resetStreakData() {
  const deletedCompletions = await prisma.taskCompletion.deleteMany({});
  const deletedPersonal = await prisma.personalTask.deleteMany({});
  const deletedSessions = await prisma.studySession.deleteMany({});
  const deletedRestDays = await prisma.plannedRestDay.deleteMany({});
  
  console.log('Streak and completion data reset successfully:', {
    deletedCompletions: deletedCompletions.count,
    deletedPersonal: deletedPersonal.count,
    deletedSessions: deletedSessions.count,
    deletedRestDays: deletedRestDays.count,
  });

  // Keep roadmaps, modules, days, tasks, categories, projects, notes intact!
  const remainingRoadmaps = await prisma.roadmap.count();
  const remainingTasks = await prisma.task.count();
  const remainingProjects = await prisma.project.count();
  const remainingNotes = await prisma.note.count();

  console.log('Preserved user curriculum & entities:', {
    remainingRoadmaps,
    remainingTasks,
    remainingProjects,
    remainingNotes,
  });

  process.exit(0);
}

resetStreakData().catch((err) => {
  console.error(err);
  process.exit(1);
});
