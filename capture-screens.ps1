$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$artifactDir = "C:\Users\krkts\.gemini\antigravity\brain\ebb2c8d0-f4d5-48dc-94a3-983689f1013b"

Write-Host "Capturing Dashboard (Dark Theme)..."
& $edge --headless=new --screenshot="$artifactDir\dashboard-dark.png" --window-size=1440,900 --virtual-time-budget=6000 "http://localhost:5173/?theme=dark"

Write-Host "Capturing Dashboard (Light Theme)..."
& $edge --headless=new --screenshot="$artifactDir\dashboard-light.png" --window-size=1440,900 --virtual-time-budget=6000 "http://localhost:5173/?theme=light"

Write-Host "Capturing Daily Planner (Dark Theme)..."
& $edge --headless=new --screenshot="$artifactDir\daily-planner.png" --window-size=1440,900 --virtual-time-budget=6000 "http://localhost:5173/planner?theme=dark"

Write-Host "Screenshots captured successfully in $artifactDir"
