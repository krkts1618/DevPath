import { execSync } from 'child_process';

const edge = '"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"';
const brain = 'C:\\Users\\krkts\\.gemini\\antigravity\\brain\\ebb2c8d0-f4d5-48dc-94a3-983689f1013b';

console.log('Capturing analytics-light.png...');
execSync(`${edge} --headless --disable-gpu --window-size=1440,1100 --virtual-time-budget=6000 "--screenshot=${brain}\\analytics-light.png" "http://localhost:5173/analytics?theme=light"`, { stdio: 'inherit' });

console.log('Capturing calendar-light.png...');
execSync(`${edge} --headless --disable-gpu --window-size=1440,1100 --virtual-time-budget=6000 "--screenshot=${brain}\\calendar-light.png" "http://localhost:5173/calendar?date=2026-11-01&theme=light"`, { stdio: 'inherit' });

console.log('Done!');
