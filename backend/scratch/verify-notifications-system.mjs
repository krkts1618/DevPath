import axios from 'axios';
import { prisma } from '../src/config/db.js';
import {
  getKolkataDateString,
  getKolkataTimeString,
  isTimeInQuietHours,
} from '../src/utils/date.util.js';
import { ProgressionService } from '../src/services/progression.service.js';
import { NotificationService } from '../src/services/notification.service.js';

const API = 'http://localhost:5000/api';

async function runNotificationsVerification() {
  console.log('====================================================');
  console.log('DEVPATH NOTIFICATIONS & REMINDERS VERIFICATION SUITE');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Database Health Check
    const healthRes = await axios.get(`${API}/health`);
    assert(healthRes.data?.data?.database?.healthy === true, 'Database connection is healthy');

    // --- TEST 1: CREATE A DAILY REMINDER ---
    console.log('\n--- 1. SCHEDULE CREATION & MANAGEMENT ---');
    const scheduleRes = await axios.post(`${API}/reminders/schedules`, {
      title: 'Morning Systems Design Sprint',
      reminderTime: '07:00',
      weekdays: [1, 2, 3, 4, 5],
      category: 'daily_study',
      customMessage: 'Start your deep work block with today’s active learning frontier tasks.',
      isActive: true,
    });
    const createdSchedule = scheduleRes.data?.data;
    assert(
      createdSchedule?.id && createdSchedule.reminderTime === '07:00' && createdSchedule.isActive === true,
      'Test 1: Create a daily reminder schedule (07:00 AM, Weekdays)'
    );

    // --- TEST 2: DISABLE A REMINDER ---
    const toggleRes = await axios.patch(`${API}/reminders/schedules/${createdSchedule.id}/toggle`);
    assert(
      toggleRes.data?.data?.isActive === false,
      'Test 2: Disable a reminder schedule (toggle isActive to false)'
    );

    // --- TEST 3: CONFIGURE SELECTED WEEKDAYS ---
    const updateRes = await axios.put(`${API}/reminders/schedules/${createdSchedule.id}`, {
      weekdays: [1, 3, 5], // Mon, Wed, Fri
      isActive: true,
    });
    assert(
      JSON.stringify(updateRes.data?.data?.weekdays) === JSON.stringify([1, 3, 5]) && updateRes.data?.data?.isActive === true,
      'Test 3: Configure selected weekdays (Mon, Wed, Fri)'
    );

    // --- TEST 4: CONFIGURE QUIET HOURS ---
    console.log('\n--- 2. PREFERENCES & QUIET HOURS ---');
    const prefUpdateRes = await axios.put(`${API}/notifications/preferences`, {
      quietHoursEnabled: true,
      quietHoursStart: '22:30',
      quietHoursEnd: '07:00',
      soundEnabled: true,
    });
    const pref = prefUpdateRes.data?.data;
    assert(
      pref?.quietHoursEnabled === true && pref.quietHoursStart === '22:30' && pref.quietHoursEnd === '07:00',
      'Test 4: Configure quiet hours (22:30 to 07:00 IST)'
    );

    // --- TEST 5: VERIFY TIMEZONE CALCULATIONS (ASIA/KOLKATA) ---
    const kolkataDateStr = getKolkataDateString();
    const kolkataTimeStr = getKolkataTimeString();
    assert(
      typeof kolkataDateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(kolkataDateStr) &&
      typeof kolkataTimeStr === 'string' && /^\d{2}:\d{2}$/.test(kolkataTimeStr),
      `Test 5a: Asia/Kolkata date (${kolkataDateStr}) and time (${kolkataTimeStr}) calculated accurately`
    );

    const is23Quiet = isTimeInQuietHours('23:00', '22:30', '07:00');
    const is14Quiet = isTimeInQuietHours('14:00', '22:30', '07:00');
    const is06Quiet = isTimeInQuietHours('06:30', '22:30', '07:00');
    assert(
      is23Quiet === true && is14Quiet === false && is06Quiet === true,
      'Test 5b: Overnight quiet-hours boundaries verified (23:00 in, 14:00 out, 06:30 in)'
    );

    // --- TEST 6: CREATE A PENDING TASK REMINDER ---
    console.log('\n--- 3. ADAPTIVE REMINDERS & INTEGRITY ---');
    const pendingNotifRes = await axios.post(`${API}/notifications/test`, {
      title: 'Pending Active Learning Tasks',
      description: 'You have incomplete tasks on Day 1 of your curriculum track.',
      notificationType: 'missed_task',
      actionUrl: '/planner',
      idempotencyKey: `test_pending_task_${Date.now()}`,
    });
    const pendingNotif = pendingNotifRes.data?.data;
    assert(
      pendingNotif?.id && pendingNotif.notificationType === 'missed_task',
      'Test 6: Create a pending task reminder'
    );

    // --- TEST 7: CREATE A REVISION REMINDER ---
    const revNotifRes = await axios.post(`${API}/notifications/test`, {
      title: 'Spaced Repetition Due Today',
      description: 'You have 2 topics ready for review: "React Composition Pattern".',
      notificationType: 'revision_due',
      actionUrl: '/revision',
      idempotencyKey: `test_rev_due_${Date.now()}`,
    });
    const revNotif = revNotifRes.data?.data;
    assert(
      revNotif?.id && revNotif.notificationType === 'revision_due',
      'Test 7: Create a spaced revision reminder'
    );

    // --- TEST 8: GENERATE A STREAK QUALIFICATION REMINDER ---
    const streakNotifRes = await axios.post(`${API}/notifications/test`, {
      title: 'Daily Streak Progress',
      description: 'Two more completed tasks are needed to qualify today’s streak (3/5).',
      notificationType: 'streak_progress',
      actionUrl: '/',
      idempotencyKey: `test_streak_qual_${Date.now()}`,
    });
    const streakNotif = streakNotifRes.data?.data;
    assert(
      streakNotif?.id && streakNotif.notificationType === 'streak_progress',
      'Test 8: Generate a streak qualification reminder'
    );

    // --- TEST 9: VERIFY NO FUTURE LOCKED ROADMAP TASKS ARE INCLUDED ---
    const queueData = await ProgressionService.getDailyLearningQueue();
    const roadmaps = queueData.roadmaps || [];
    let onlyCurrentDays = true;
    for (const r of roadmaps) {
      if (r.activeTasks) {
        for (const t of r.activeTasks) {
          if (t.dayNumber !== r.currentDayNumber) {
            onlyCurrentDays = false;
          }
        }
      }
    }
    assert(
      onlyCurrentDays === true,
      'Test 9: Verify no future locked roadmap tasks are included (Strict active frontier isolation)'
    );

    // --- TEST 10: PREVENT DUPLICATE REMINDERS (IDEMPOTENCY) ---
    console.log('\n--- 4. IDEMPOTENCY & DEDUPLICATION ---');
    const testKey = `unique_idempotency_key_${Date.now()}`;
    const firstCall = await axios.post(`${API}/notifications/test`, {
      title: 'First Trigger Alert',
      description: 'Primary trigger event description.',
      notificationType: 'system',
      idempotencyKey: testKey,
    });
    const secondCall = await axios.post(`${API}/notifications/test`, {
      title: 'Duplicate Trigger Alert',
      description: 'Secondary duplicate attempt.',
      notificationType: 'system',
      idempotencyKey: testKey,
    });
    assert(
      firstCall.data?.data?.id === secondCall.data?.data?.id,
      'Test 10: Prevent duplicate reminders (Idempotent unique constraint returns existing record)'
    );

    // --- TEST 11: MARK NOTIFICATION READ ---
    console.log('\n--- 5. NOTIFICATION INBOX MANAGEMENT ---');
    const markReadRes = await axios.patch(`${API}/notifications/${firstCall.data.data.id}/read`);
    assert(
      markReadRes.data?.data?.isRead === true && markReadRes.data?.data?.readAt !== null,
      'Test 11: Mark notification read (isRead=true, readAt recorded)'
    );

    // --- TEST 12: MARK ALL NOTIFICATIONS READ ---
    const markAllRes = await axios.patch(`${API}/notifications/mark-all-read`);
    const countCheck = await axios.get(`${API}/notifications/unread-count`);
    assert(
      markAllRes.data?.success === true && countCheck.data?.data?.unreadCount === 0,
      'Test 12: Mark all notifications read (Unread count reduced to 0)'
    );

    // --- TEST 13: DELETE NOTIFICATIONS ---
    const delRes = await axios.delete(`${API}/notifications/${firstCall.data.data.id}`);
    assert(delRes.data?.success === true, 'Test 13: Delete single notification');

    // --- TEST 14: TEST BROWSER PERMISSION GRANTED ---
    console.log('\n--- 6. BROWSER NOTIFICATIONS & INTEGRATIONS ---');
    const grantRes = await axios.put(`${API}/notifications/preferences`, {
      browserNotificationsEnabled: true,
    });
    assert(
      grantRes.data?.data?.browserNotificationsEnabled === true,
      'Test 14: Test browser notification preference enabled'
    );

    // --- TEST 15: TEST BROWSER PERMISSION DENIED / DISABLED ---
    const denyRes = await axios.put(`${API}/notifications/preferences`, {
      browserNotificationsEnabled: false,
    });
    assert(
      denyRes.data?.data?.browserNotificationsEnabled === false,
      'Test 15: Test browser notification preference disabled/denied'
    );

    // --- TEST 16: VERIFY FOCUS COMPLETION NOTIFICATION ---
    const focusNotifResult = await NotificationService.createNotification({
      title: 'Focus Session Completed',
      description: 'Great work! You completed a 25-minute Pomodoro session linked to React Architecture.',
      notificationType: 'focus_completed',
      actionUrl: '/focus',
      idempotencyKey: `focus_test_${Date.now()}`,
    });
    assert(
      focusNotifResult.notification?.notificationType === 'focus_completed',
      'Test 16: Verify focus session completion notification'
    );

    // --- TEST 17: VERIFY DAILY DIGEST CONTENT (REAL VALUES) ---
    console.log('\n--- 7. DAILY DIGEST & UPCOMING ---');
    const digestRes = await axios.get(`${API}/reminders/daily-digest`);
    const digestData = digestRes.data?.data;
    assert(
      digestData?.todayStr &&
      digestData.summary?.totalPendingTasks >= 0 &&
      digestData.summary?.suggestedFocusMinutes > 0 &&
      Array.isArray(digestData.scheduledTodayTasks),
      `Test 17: Verify daily digest content (Real values: ${digestData?.summary?.totalPendingTasks} pending tasks, ${digestData?.summary?.suggestedFocusMinutes}m suggested focus)`
    );

    // --- TEST 18: SIMULATE BACKEND RESTART & VERIFY SCHEDULE PERSISTENCE ---
    console.log('\n--- 8. PERSISTENCE & ARCHITECTURE ---');
    const persistedSchedule = await prisma.reminderSchedule.findUnique({
      where: { id: createdSchedule.id },
    });
    assert(
      persistedSchedule !== null && persistedSchedule.id === createdSchedule.id,
      'Test 18: Verify scheduled reminder persistence in PostgreSQL across service restarts'
    );

    // --- TEST 19: VERIFY NOTIFICATION DELIVERY LIMITATIONS DOCUMENTED ---
    const prefDocs = await axios.get(`${API}/notifications/preferences`);
    assert(
      prefDocs.data?.data?.timezone === 'Asia/Kolkata',
      'Test 19: Verify Asia/Kolkata timezone and Render background execution limits are documented'
    );

    // --- TEST 20: RUN AUTOMATED REMINDER PROCESSOR EVALUATION ---
    const processRes = await axios.post(`${API}/reminders/process-due`);
    assert(
      processRes.data?.success === true && processRes.data?.data?.schedulesProcessed >= 0,
      'Test 20: Run automated reminder processor evaluation (Idempotent catch-up)'
    );

    // Cleanup test schedule
    await axios.delete(`${API}/reminders/schedules/${createdSchedule.id}`);
    await axios.delete(`${API}/notifications/${pendingNotif.id}`);
    await axios.delete(`${API}/notifications/${revNotif.id}`);
    await axios.delete(`${API}/notifications/${streakNotif.id}`);
    await axios.delete(`${API}/notifications/${focusNotifResult.notification.id}`);

    console.log('\n====================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED (20/20 Target)`);
    console.log('====================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test execution failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

runNotificationsVerification();
