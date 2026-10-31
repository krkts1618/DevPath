import axios from 'axios';

const API = 'http://localhost:5000/api';

const endpoints = [
  { name: 'Dashboard Stats', url: `${API}/dashboard/stats` },
  { name: 'Daily Planner', url: `${API}/dashboard/daily-planner` },
  { name: 'Roadmaps Listing', url: `${API}/roadmaps` },
  { name: 'Reminders Upcoming', url: `${API}/reminders/upcoming` },
  { name: 'Notifications Unread Count', url: `${API}/notifications/unread-count` },
  { name: 'Active Study Session', url: `${API}/study-sessions/active` },
  { name: 'Study Analytics', url: `${API}/study-sessions/analytics` },
];

async function measure() {
  console.log('--- BASELINE BENCHMARK: 2 RUNS PER ENDPOINT ---');
  for (const ep of endpoints) {
    const times = [];
    for (let i = 0; i < 2; i++) {
      const start = performance.now();
      try {
        await axios.get(ep.url);
        const duration = performance.now() - start;
        times.push(duration);
      } catch (err) {
        console.error(`Error fetching ${ep.name}:`, err.message);
      }
    }
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    console.log(`${ep.name.padEnd(28)}: Run 1: ${times[0].toFixed(1)}ms | Run 2: ${times[1].toFixed(1)}ms | Avg: ${avg.toFixed(1)}ms`);
  }
}

measure();
