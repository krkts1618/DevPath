import { execSync } from 'child_process';
import axios from 'axios';

const edge = '"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"';
const brain = 'C:\\Users\\krkts\\.gemini\\antigravity\\brain\\ebb2c8d0-f4d5-48dc-94a3-983689f1013b';
const API = 'http://localhost:5000/api';

async function setupAndCapture() {
  console.log('Seeding sample notification items for screenshots...');
  try {
    // 1. Seed sample schedules
    await axios.post(`${API}/reminders/schedules`, {
      title: 'Morning Systems Design Kickoff',
      reminderTime: '07:00',
      weekdays: [1, 2, 3, 4, 5],
      category: 'daily_study',
      customMessage: 'Kick off your engineering deep work block with today’s active learning queue.',
      isActive: true,
    });

    await axios.post(`${API}/reminders/schedules`, {
      title: 'Evening Spaced Recall Review',
      reminderTime: '19:30',
      weekdays: [0, 1, 2, 3, 4, 5, 6],
      category: 'revision',
      customMessage: 'Solidify your memory with spaced repetition recall before closing for the night.',
      isActive: true,
    });

    // 2. Seed realistic notifications
    await axios.post(`${API}/notifications/test`, {
      title: 'Morning Deep Work Ready',
      description: 'You have 5 active learning tasks ready at your curriculum frontier across Full-Stack & Systems tracks.',
      notificationType: 'learning_reminder',
      actionUrl: '/planner',
      idempotencyKey: 'seed_notif_1',
    });

    await axios.post(`${API}/notifications/test`, {
      title: 'Streak Progress (3/5 Complete)',
      description: 'Two more completed tasks are needed to qualify today’s streak and maintain continuity.',
      notificationType: 'streak_progress',
      actionUrl: '/',
      idempotencyKey: 'seed_notif_2',
    });

    await axios.post(`${API}/notifications/test`, {
      title: 'Spaced Repetition Due Today',
      description: '2 topics are ready for active recall: "React Context Pattern" and "PostgreSQL Indexing".',
      notificationType: 'revision_due',
      actionUrl: '/revision',
      idempotencyKey: 'seed_notif_3',
    });

    await axios.post(`${API}/notifications/test`, {
      title: 'Focus Session Completed',
      description: 'Great work! You completed a 25-minute Pomodoro session linked to "State Management".',
      notificationType: 'focus_completed',
      actionUrl: '/focus',
      idempotencyKey: 'seed_notif_4',
    });
  } catch (err) {
    console.warn('Seeding note:', err.message);
  }

  const targets = [
    { name: 'notifications-dark.png', url: 'http://localhost:5173/notifications?theme=dark' },
    { name: 'notifications-light.png', url: 'http://localhost:5173/notifications?theme=light' },
    { name: 'notifications-schedules-dark.png', url: 'http://localhost:5173/notifications?tab=schedules&theme=dark' },
    { name: 'notifications-digest-dark.png', url: 'http://localhost:5173/notifications?tab=digest&theme=dark' },
    { name: 'dashboard-notifications-dark.png', url: 'http://localhost:5173/?theme=dark' },
  ];

  for (const t of targets) {
    console.log(`Capturing ${t.name}...`);
    try {
      execSync(
        `${edge} --headless --disable-gpu --window-size=1440,1050 --virtual-time-budget=6000 "--screenshot=${brain}\\${t.name}" "${t.url}"`,
        { stdio: 'inherit' }
      );
      console.log(`Captured ${t.name} successfully.`);
    } catch (err) {
      console.error(`Failed ${t.name}:`, err.message);
    }
  }

  console.log('Notification screenshots completed!');
}

setupAndCapture();
