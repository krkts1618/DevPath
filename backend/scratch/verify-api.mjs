import axios from 'axios';

const API = 'http://localhost:5000/api';

async function testApi() {
  console.log('Testing DevPath Backend API...');
  
  // 1. Health check
  const healthRes = await axios.get(`${API}/health`);
  console.log('Health check:', healthRes.data.success ? 'PASS' : 'FAIL', healthRes.data.data.database);

  // 2. Notes API
  const noteRes = await axios.post(`${API}/notes`, {
    title: 'Test Note on React Patterns',
    content: '# React 18 Patterns\n\n```javascript\nconst [state, setState] = useState(0);\n```\n\n- Hook 1\n- Hook 2',
    tags: ['react', 'frontend'],
  });
  console.log('Create Note:', noteRes.data.success ? 'PASS' : 'FAIL', noteRes.data.data.id);
  const noteId = noteRes.data.data.id;

  // Toggle favorite
  const favRes = await axios.patch(`${API}/notes/${noteId}/favorite`);
  console.log('Toggle Favorite:', favRes.data.data.isFavorite ? 'PASS' : 'FAIL');

  // 3. Revisions API
  const revRes = await axios.post(`${API}/revisions`, {
    topic: 'React Concurrency & Suspense',
    noteId: noteId,
    priority: 'high',
    intervalDays: 1,
  });
  console.log('Create Revision:', revRes.data.success ? 'PASS' : 'FAIL', revRes.data.data.id);
  const revId = revRes.data.data.id;

  // Complete revision session
  const completeRes = await axios.post(`${API}/revisions/${revId}/complete`, {
    rating: 'good',
    notes: 'Understood Suspense boundary mechanics well',
    durationMinutes: 15,
  });
  console.log('Complete Revision Session (rating: good):', completeRes.data.success ? 'PASS' : 'FAIL', 'Next stage:', completeRes.data.data.revision.stage);

  // 4. Projects API
  const projRes = await axios.post(`${API}/projects`, {
    name: 'DevPath Engine Architecture',
    description: 'High performance engineering tracker',
    techStack: 'React, Node.js, Prisma, PostgreSQL',
    priority: 'high',
    status: 'active',
  });
  console.log('Create Project:', projRes.data.success ? 'PASS' : 'FAIL', projRes.data.data.id);
  const projId = projRes.data.data.id;

  // Add milestone
  const msRes = await axios.post(`${API}/projects/${projId}/milestones`, {
    title: 'M1: Core Notes & Revision Engine',
    status: 'completed',
  });
  console.log('Add Milestone:', msRes.data.success ? 'PASS' : 'FAIL');

  // Add task
  const taskRes = await axios.post(`${API}/projects/${projId}/tasks`, {
    title: 'Build Markdown Editor UI',
    priority: 'high',
    status: 'completed',
  });
  console.log('Add Task:', taskRes.data.success ? 'PASS' : 'FAIL');

  // Get project to check progress
  const getProj = await axios.get(`${API}/projects/${projId}`);
  console.log('Project Progress (Expect 100%):', getProj.data.data.progress + '%');

  // Clean up test data safely
  await axios.delete(`${API}/projects/${projId}`);
  await axios.delete(`${API}/revisions/${revId}`);
  await axios.delete(`${API}/notes/${noteId}`);
  console.log('Cleanup completed successfully!');
}

testApi().catch((err) => {
  console.error('Test Failed:', err.response?.data || err.message);
  process.exit(1);
});
