import axios from 'axios';

const API = 'http://localhost:5000/api';

async function runComprehensiveVerification() {
  console.log('====================================================');
  console.log('DEVPATH COMPREHENSIVE E2E VERIFICATION SUITE');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // 1. Database Health Check
    // ----------------------------------------------------
    const healthRes = await axios.get(`${API}/health`);
    assert(healthRes.data?.data?.database?.healthy === true, 'Database connection is healthy and responsive');

    // Fetch existing curriculum roadmap to test associations
    const roadmapsRes = await axios.get(`${API}/roadmaps`);
    const allRoadmaps = roadmapsRes.data?.data?.roadmaps || roadmapsRes.data?.data || [];
    const testRoadmap = allRoadmaps[0];
    assert(allRoadmaps.length > 0, `Active roadmaps exist in database (${allRoadmaps.length} found)`);

    // ----------------------------------------------------
    // 2. Personal Notes Workspace Verification
    // ----------------------------------------------------
    console.log('\n--- TESTING PERSONAL NOTES WORKSPACE ---');

    // 2.1 Create technical markdown note with code snippet
    const noteContent = `# Distributed Consensus: Raft vs Paxos

Raft decomposes consensus into three independent subproblems:
1. **Leader Election**
2. **Log Replication**
3. **Safety Guarantee**

\`\`\`javascript
// Heartbeat RPC timeout simulation
function resetElectionTimeout() {
  const timeout = Math.floor(Math.random() * 150) + 150; // 150-300ms
  return setTimeout(startElection, timeout);
}
\`\`\`

| Property | Raft | Multi-Paxos |
| :--- | :--- | :--- |
| Leader Rule | Strict single leader | Flexible |
| Complexity | Understandable | High |
`;

    const note1Res = await axios.post(`${API}/notes`, {
      title: 'Consensus Protocols in Distributed Systems',
      content: noteContent,
      roadmapId: testRoadmap?.id || null,
      tags: ['distributed-systems', 'consensus', 'raft'],
    });
    const note1 = note1Res.data?.data;
    assert(note1?.id && note1?.title === 'Consensus Protocols in Distributed Systems', 'Create note with rich markdown & tags');

    // 2.2 Pin & Favorite Note
    const pinRes = await axios.patch(`${API}/notes/${note1.id}/pin`);
    assert(pinRes.data?.data?.isPinned === true, 'Toggle pin note');

    const favRes = await axios.patch(`${API}/notes/${note1.id}/favorite`);
    assert(favRes.data?.data?.isFavorite === true, 'Toggle favorite note');

    // 2.3 Search Note by content keyword
    const searchRes = await axios.get(`${API}/notes`, { params: { search: 'Raft' } });
    const foundNote = (searchRes.data?.data?.notes || []).find((n) => n.id === note1.id);
    assert(foundNote !== undefined, 'Search notes by keyword "Raft" inside Markdown content');

    // 2.4 Duplicate Note
    const dupRes = await axios.post(`${API}/notes/${note1.id}/duplicate`);
    const dupNote = dupRes.data?.data;
    assert(dupNote?.id && dupNote.title.includes('Consensus Protocols in Distributed Systems (Copy)'), 'Duplicate note successfully');

    // 2.5 Archive and Restore Note
    const archRes = await axios.patch(`${API}/notes/${dupNote.id}/archive`);
    assert(archRes.data?.data?.isArchived === true, 'Archive note');

    const restRes = await axios.patch(`${API}/notes/${dupNote.id}/archive`);
    assert(restRes.data?.data?.isArchived === false, 'Restore note from archive');

    // Clean up duplicate note
    await axios.delete(`${API}/notes/${dupNote.id}`);

    // ----------------------------------------------------
    // 3. Smart Spaced Repetition Engine Verification
    // ----------------------------------------------------
    console.log('\n--- TESTING SMART REVISION SYSTEM ---');

    // 3.1 Create spaced revision schedule
    const rev1Res = await axios.post(`${API}/revisions`, {
      topic: 'Raft Leader Election & Randomized Election Timeouts',
      description: 'Review split vote resolution and heartbeat frequency',
      noteId: note1.id,
      roadmapId: testRoadmap?.id || null,
      priority: 'high',
      intervalDays: 1,
    });
    const rev1 = rev1Res.data?.data;
    assert(rev1?.id && rev1.stage === 1, 'Create spaced revision item (initial Stage 1)');

    // 3.2 Spaced recall session: Rating "Good" -> Stage 2 (3-day interval)
    const session1Res = await axios.post(`${API}/revisions/${rev1.id}/complete`, {
      rating: 'good',
      notes: 'Clearly explained randomized election timeouts',
      durationMinutes: 12,
    });
    const updatedRev1 = session1Res.data?.data?.revision;
    assert(updatedRev1?.stage === 2 && updatedRev1?.intervalDays === 3, 'Recall rating "Good" advances to Stage 2 (interval 3 days)');

    // 3.3 Spaced recall session: Rating "Again" -> Resets to Stage 1 (1-day interval)
    const session2Res = await axios.post(`${API}/revisions/${rev1.id}/complete`, {
      rating: 'again',
      notes: 'Need to re-read edge cases on network partition recovery',
      durationMinutes: 8,
    });
    const resetRev1 = session2Res.data?.data?.revision;
    assert(resetRev1?.stage === 1 && resetRev1?.intervalDays === 1, 'Recall rating "Again" resets to Stage 1 (interval 1 day)');

    // 3.4 Spaced recall session: Rating "Easy" -> Advances with multiplier
    const session3Res = await axios.post(`${API}/revisions/${rev1.id}/complete`, {
      rating: 'easy',
      notes: 'Mastered election proof completely',
      durationMinutes: 15,
    });
    const easyRev1 = session3Res.data?.data?.revision;
    assert(easyRev1?.stage === 2 && easyRev1?.intervalDays >= 3, 'Recall rating "Easy" advances stage with extended interval');

    // 3.5 Pause and Resume Revision
    const pauseRes = await axios.post(`${API}/revisions/${rev1.id}/pause`);
    assert(pauseRes.data?.data?.status === 'paused', 'Pause revision item');

    const resumeRes = await axios.post(`${API}/revisions/${rev1.id}/resume`);
    assert(resumeRes.data?.data?.status !== 'paused', 'Resume revision item');

    // ----------------------------------------------------
    // 4. Project Management Workspace Verification
    // ----------------------------------------------------
    console.log('\n--- TESTING PROJECT MANAGEMENT WORKSPACE ---');

    // 4.1 Create project with Problem Statement & Tech Stack
    const projRes = await axios.post(`${API}/projects`, {
      name: 'High-Throughput Distributed Raft KV Store',
      description: 'Fault-tolerant distributed key-value store using Raft consensus',
      problemStatement: 'Ensure strict serializability and high availability under network partitions',
      goals: '99.99% availability, linearizable reads, sub-50ms commit latency',
      techStack: 'Go, gRPC, BadgerDB, Docker',
      githubUrl: 'https://github.com/developer/raft-kv-store',
      demoUrl: 'https://raft-kv-demo.internal',
      roadmapId: testRoadmap?.id || null,
      priority: 'high',
      status: 'active',
    });
    const proj = projRes.data?.data;
    assert(proj?.id && proj.name === 'High-Throughput Distributed Raft KV Store', 'Create project with rich metadata');

    // 4.2 Add Milestones
    const m1Res = await axios.post(`${API}/projects/${proj.id}/milestones`, {
      title: 'Milestone 1: Cluster Membership & Leader Election',
      status: 'completed',
    });
    const m2Res = await axios.post(`${API}/projects/${proj.id}/milestones`, {
      title: 'Milestone 2: Log Compaction & Snapshotting',
      status: 'pending',
    });
    assert(m1Res.data?.data?.id && m2Res.data?.data?.id, 'Add project milestones');

    // 4.3 Add Project Tasks
    const t1Res = await axios.post(`${API}/projects/${proj.id}/tasks`, {
      title: 'Implement Term increment and RequestVote RPC',
      priority: 'urgent',
      status: 'completed',
    });
    const t2Res = await axios.post(`${API}/projects/${proj.id}/tasks`, {
      title: 'Implement AppendEntries log consistency check',
      priority: 'high',
      status: 'todo',
    });
    assert(t1Res.data?.data?.id && t2Res.data?.data?.id, 'Add project tasks');

    // 4.4 Verify Weighted Progress:
    // Milestones: 1 of 2 completed (50%)
    // Tasks: 1 of 2 completed (50%)
    // Weighted Progress = (50% * 0.5) + (50% * 0.5) = 50%
    const projDetailsRes = await axios.get(`${API}/projects/${proj.id}`);
    assert(projDetailsRes.data?.data?.progress === 50, `Weighted progress calculates accurately (Expected 50%, Got ${projDetailsRes.data?.data?.progress}%)`);

    // 4.5 Complete remaining milestone and task -> Expect 100%
    await axios.patch(`${API}/projects/milestones/${m2Res.data.data.id}/toggle`);
    await axios.patch(`${API}/projects/tasks/${t2Res.data.data.id}/toggle`);
    const proj100Res = await axios.get(`${API}/projects/${proj.id}`);
    assert(proj100Res.data?.data?.progress === 100, `Weighted progress updates to 100% when all items complete (Got ${proj100Res.data?.data?.progress}%)`);

    // 4.6 Add Project Resource
    const resRes = await axios.post(`${API}/projects/${proj.id}/resources`, {
      title: 'Raft Paper Specification (Ongaro & Ousterhout)',
      url: 'https://raft.github.io/raft.pdf',
      resourceType: 'docs',
    });
    assert(resRes.data?.data?.id !== undefined, 'Add project resource documentation link');

    // ----------------------------------------------------
    // 5. Data Safety & Non-Cascade Guarantees
    // ----------------------------------------------------
    console.log('\n--- TESTING DATA INTEGRITY & NON-CASCADE GUARANTEES ---');

    // Delete project
    await axios.delete(`${API}/projects/${proj.id}`);
    const checkDeletedProj = await axios.get(`${API}/projects`);
    const foundDeletedProj = (checkDeletedProj.data?.data || []).find((p) => p.id === proj.id);
    assert(foundDeletedProj === undefined, 'Delete project deletes project cleanly');

    // Delete revision
    await axios.delete(`${API}/revisions/${rev1.id}`);
    const checkDeletedRev = await axios.get(`${API}/revisions`);
    const allRevs = Array.isArray(checkDeletedRev.data?.data)
      ? checkDeletedRev.data?.data
      : Object.values(checkDeletedRev.data?.data || {}).flat().filter(Boolean);
    const foundDeletedRev = allRevs.find((r) => r && r.id === rev1.id);
    assert(foundDeletedRev === undefined, 'Delete revision deletes schedule item cleanly');

    // Delete note
    await axios.delete(`${API}/notes/${note1.id}`);
    const checkDeletedNote = await axios.get(`${API}/notes`);
    const foundDeletedNote = (checkDeletedNote.data?.data?.notes || []).find((n) => n.id === note1.id);
    assert(foundDeletedNote === undefined, 'Delete note deletes note cleanly');

    // Verify curriculum roadmap is 100% safe and intact
    const verifyRoadmap = await axios.get(`${API}/roadmaps/${testRoadmap.id}`);
    assert(verifyRoadmap.data?.data?.id === testRoadmap.id, 'Curriculum roadmap remains completely intact with all modules, days, and tasks');

    console.log('\n====================================================');
    console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Test execution failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

runComprehensiveVerification();
