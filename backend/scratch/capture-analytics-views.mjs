import { execSync } from 'child_process';

const edge = '"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"';
const brain = 'C:\\Users\\krkts\\.gemini\\antigravity\\brain\\ebb2c8d0-f4d5-48dc-94a3-983689f1013b';

const targets = [
  { name: 'analytics-dark.png', url: 'http://localhost:5173/analytics?theme=dark' },
  { name: 'analytics-light.png', url: 'http://localhost:5173/analytics?theme=light' },
];

for (const t of targets) {
  console.log(`Capturing ${t.name}...`);
  try {
    execSync(
      `${edge} --headless --disable-gpu --window-size=1440,1100 --virtual-time-budget=8000 "--screenshot=${brain}\\${t.name}" "${t.url}"`,
      { stdio: 'inherit' }
    );
    console.log(`✓ Saved ${t.name}`);
  } catch (err) {
    console.error(`Failed ${t.name}:`, err.message);
  }
}

console.log('All analytics screenshots captured successfully!');
