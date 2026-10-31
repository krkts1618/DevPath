import { execSync } from 'child_process';

const edge = '"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"';
const brain = 'C:\\Users\\krkts\\.gemini\\antigravity\\brain\\ebb2c8d0-f4d5-48dc-94a3-983689f1013b';

const targets = [
  { name: 'notes-dark.png', url: 'http://localhost:5173/notes?theme=dark' },
  { name: 'notes-light.png', url: 'http://localhost:5173/notes?theme=light' },
  { name: 'revision-dark.png', url: 'http://localhost:5173/revision?theme=dark' },
  { name: 'revision-light.png', url: 'http://localhost:5173/revision?theme=light' },
  { name: 'projects-dark.png', url: 'http://localhost:5173/projects?theme=dark' },
  { name: 'projects-light.png', url: 'http://localhost:5173/projects?theme=light' },
];

for (const t of targets) {
  console.log(`Capturing ${t.name}...`);
  try {
    execSync(
      `${edge} --headless --disable-gpu --window-size=1440,1050 --virtual-time-budget=6000 "--screenshot=${brain}\\${t.name}" "${t.url}"`,
      { stdio: 'inherit' }
    );
  } catch (err) {
    console.error(`Failed ${t.name}:`, err.message);
  }
}

console.log('All screenshots captured successfully!');
