import axios from 'axios';

async function test() {
  const p = await axios.get('http://localhost:5000/api/notifications/preferences');
  console.log('Preferences:', p.data);
  const s = await axios.get('http://localhost:5000/api/reminders/schedules');
  console.log('Schedules:', s.data);
  const d = await axios.get('http://localhost:5000/api/reminders/daily-digest');
  console.log('Digest summary:', d.data?.data?.summary);
}

test().catch(console.error);
