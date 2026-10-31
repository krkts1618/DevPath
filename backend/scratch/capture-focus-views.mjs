import { execSync } from 'child_process';

const edge = '"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"';
const brain = 'C:\\Users\\krkts\\.gemini\\antigravity\\brain\\ebb2c8d0-f4d5-48dc-94a3-983689f1013b';

const targets = [
  { name: 'focus-dark.png', url: 'http://localhost:5173/focus?theme=dark' },
  { name: 'focus-light.png', url: 'http://localhost:5173/focus?theme=light' },
  { name: 'dashboard-focus-dark.png', url: 'http://localhost:5173/?theme=dark' },
  { name: 'planner-focus-dark.png', url: 'http://localhost:5173/planner?theme=dark' },
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

console.log('Focus screenshots completed!');
