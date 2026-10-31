import axios from 'axios';

const API = 'http://localhost:5000/api';

async function testStudySessions() {
  console.log('Testing Study Sessions Backend API...');

  // 1. Get Active Session (should be null initially)
  const initialActive = await axios.get(`${API}/study-sessions/active`);
  console.log('Initial Active Session:', initialActive.data.data === null ? 'PASS (None active)' : 'FOUND');

  // 2. Start Pomodoro session
  const startRes = await axios.post(`${API}/study-sessions/start`, {
    sessionType: 'pomodoro',
    title: 'Focus: PostgreSQL Query Optimization',
    targetDurationMinutes: 25,
  });
  console.log('Start Pomodoro Session:', startRes.data.success ? 'PASS' : 'FAIL', startRes.data.data.id);
  const sessionId = startRes.data.data.id;

  // 3. Test Single Active Session constraint (Attempting to start second session must fail with 409)
  try {
    await axios.post(`${API}/study-sessions/start`, {
      sessionType: 'custom',
      targetDurationMinutes: 15,
    });
    console.error('Single active session constraint: FAIL (Allowed second session)');
    process.exit(1);
  } catch (err) {
    if (err.response?.status === 409) {
      console.log('Single active session constraint: PASS (Correctly rejected with 409 Conflict)');
    } else {
      console.error('Single active session constraint: FAIL', err.message);
      process.exit(1);
    }
  }

  // 4. Pause Session
  const pauseRes = await axios.post(`${API}/study-sessions/${sessionId}/pause`);
  console.log('Pause Session:', pauseRes.data.data.status === 'paused' ? 'PASS' : 'FAIL');

  // 5. Resume Session
  const resumeRes = await axios.post(`${API}/study-sessions/${sessionId}/resume`);
  console.log('Resume Session:', resumeRes.data.data.status === 'active' ? 'PASS' : 'FAIL');

  // 6. Complete Session
  const completeRes = await axios.post(`${API}/study-sessions/${sessionId}/complete`, {
    actualDurationSeconds: 1500, // 25 mins
    notes: 'Covered indexing and explain analyze',
  });
  console.log('Complete Session:', completeRes.data.data.status === 'completed' ? 'PASS' : 'FAIL', 'Actual seconds:', completeRes.data.data.actualDurationSeconds);

  // 7. Start Stopwatch Session
  const swRes = await axios.post(`${API}/study-sessions/start`, {
    sessionType: 'stopwatch',
    title: 'Stopwatch Code Sprint',
  });
  console.log('Start Stopwatch Session:', swRes.data.success ? 'PASS' : 'FAIL', swRes.data.data.id);
  const swId = swRes.data.data.id;

  // Interrupt Stopwatch Session
  const intRes = await axios.post(`${API}/study-sessions/${swId}/interrupt`, {
    actualDurationSeconds: 300,
  });
  console.log('Interrupt Session:', intRes.data.data.status === 'interrupted' ? 'PASS' : 'FAIL');

  // 8. Get History
  const histRes = await axios.get(`${API}/study-sessions/history`);
  console.log('Get Session History:', histRes.data.data.sessions.length >= 2 ? 'PASS' : 'FAIL', 'Count:', histRes.data.data.sessions.length);

  // 9. Analytics
  const anaRes = await axios.get(`${API}/study-sessions/analytics`);
  console.log('Get Study Analytics: PASS', {
    todayMinutes: anaRes.data.data.todayFocusMinutes,
    completedSessions: anaRes.data.data.completedSessionsCount,
    longestSession: anaRes.data.data.longestSessionMinutes,
  });

  // Cleanup test sessions
  await axios.delete(`${API}/study-sessions/${sessionId}`);
  await axios.delete(`${API}/study-sessions/${swId}`);
  console.log('Test sessions cleaned up successfully!');
}

testStudySessions().catch((err) => {
  console.error('Test Failed:', err.response?.data || err.message);
  process.exit(1);
});
