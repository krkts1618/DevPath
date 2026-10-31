// English Communication Curriculum (84 Days, 12 Modules)

const englishModules = [
  {
    title: 'Module 1: Sentence Foundations & Simple Present',
    description: 'Subject-Verb-Object structures, everyday vocabulary, helping verbs (am/is/are), and self-introduction speeches.',
    startingDay: 1,
    endingDay: 7,
    displayOrder: 1,
  },
  {
    title: 'Module 2: Tenses: Past Simple, Future Forms & Auxiliaries',
    description: 'Regular/irregular past verbs, was/were, have/has/had, do/does/did, and future will vs going to.',
    startingDay: 8,
    endingDay: 14,
    displayOrder: 2,
  },
  {
    title: 'Module 3: Question Formation, Negatives & Natural Responses',
    description: 'WH-questions, auxiliary question inversions, negative contraction pronunciation, and conversational follow-ups.',
    startingDay: 15,
    endingDay: 21,
    displayOrder: 3,
  },
  {
    title: 'Module 4: Sentence Connectors & Event Narration',
    description: 'Coordinating and subordinating conjunctions (although, because, whereas), storytelling, and technical problem narration.',
    startingDay: 22,
    endingDay: 28,
    displayOrder: 4,
  },
  {
    title: 'Module 5: Precision Word Choice, Synonyms & Collocations',
    description: 'Replacing vague words with technical precision, corporate phrasal verbs, idioms, and natural fluency expressions.',
    startingDay: 29,
    endingDay: 35,
    displayOrder: 5,
  },
  {
    title: 'Module 6: Expressing Opinions, Trade-offs & Hesitation Reduction',
    description: 'Stating technical opinions, agreeing/disagreeing diplomatically, pros/cons discourse, and filler reduction drills.',
    startingDay: 36,
    endingDay: 42,
    displayOrder: 6,
  },
  {
    title: 'Module 7: Small Talk, Professional Networking & Clarification',
    description: 'Approaching new peers, networking small talk, discussing technical hobbies, and asking for clarification.',
    startingDay: 43,
    endingDay: 49,
    displayOrder: 7,
  },
  {
    title: 'Module 8: Polite Disagreement, Assertiveness & Conflict Resolution',
    description: 'Diplomatic phrases for disagreements, handling misunderstandings, active listening, and constructive feedback.',
    startingDay: 50,
    endingDay: 56,
    displayOrder: 8,
  },
  {
    title: 'Module 9: Professional Technical Pitch & Project Explanation',
    description: 'Explaining B.Tech background, technical skills, architecture walkthroughs, and engineering challenges.',
    startingDay: 57,
    endingDay: 63,
    displayOrder: 9,
  },
  {
    title: 'Module 10: Workplace Communication: Emails, Slack & Daily Standups',
    description: 'Writing effective engineering emails, Slack/Teams updates, async bug reports, and 2-minute daily standup updates.',
    startingDay: 64,
    endingDay: 70,
    displayOrder: 10,
  },
  {
    title: 'Module 11: HR Interview Mastery & STAR Behavioral Responses',
    description: 'Strengths and weaknesses, leadership, conflict resolution, career aspirations, and STAR interview structure.',
    startingDay: 71,
    endingDay: 77,
    displayOrder: 11,
  },
  {
    title: 'Module 12: Impromptu Speaking, Full Placement Mocks & Final Assessment',
    description: 'JAM (Just A Minute) impromptu speeches, spontaneous technical Q&A, comprehensive mock interview, and final review.',
    startingDay: 78,
    endingDay: 84,
    displayOrder: 12,
  },
];

const dayData = [];

for (let d = 1; d <= 84; d++) {
  const modIdx = Math.floor((d - 1) / 7);
  const titles = [
    'Sentence Foundations & Simple Present',
    'Tenses: Past Simple, Future Forms & Auxiliaries',
    'Question Formation, Negatives & Natural Responses',
    'Sentence Connectors & Event Narration',
    'Precision Word Choice, Synonyms & Collocations',
    'Expressing Opinions, Trade-offs & Hesitation Reduction',
    'Small Talk, Professional Networking & Clarification',
    'Polite Disagreement, Assertiveness & Conflict Resolution',
    'Professional Technical Pitch & Project Explanation',
    'Workplace Communication: Emails, Slack & Daily Standups',
    'HR Interview Mastery & STAR Behavioral Responses',
    'Impromptu Speaking, Full Placement Mocks & Final Assessment',
  ];
  const modTitle = titles[modIdx];

  dayData.push({
    dayNumber: d,
    moduleIndex: modIdx,
    title: `Day ${d}: ${modTitle} - Practice ${(d - 1) % 7 + 1}`,
    objective: `Complete 30-minute structured English practice including 5 vocabulary words with Telugu meanings, grammar, and speaking.`,
    tasks: [
      {
        title: `Learn 5 professional vocabulary words with Telugu meanings & examples`,
        desc: `Memorize 5 words for Day ${d}, understand Telugu translations, pronounce aloud, and construct original sample sentences.`,
        type: 'learn',
        dur: 5,
      },
      {
        title: `Grammar & sentence structure exercise for Day ${d}`,
        desc: `Practice targeted grammar rules in ${modTitle} (7 minutes focused rule exercise).`,
        type: 'learn',
        dur: 7,
      },
      {
        title: `Active speaking drill: 2-minute recorded speech on technical topic`,
        desc: `Record continuous spoken audio for 2 minutes without pausing or reading from notes.`,
        type: 'practice',
        dur: 8,
      },
      {
        title: `Simulated conversation practice and prompt response`,
        desc: `Practice spontaneous responses to common interview and workplace dialogue scenarios.`,
        type: 'practice',
        dur: 5,
      },
      {
        title: `Self-review, pronunciation check, and error logging`,
        desc: `Listen to speaking recording, identify filler words (um, uh), and log notes for continuous improvement.`,
        type: 'revise',
        dur: 5,
      },
    ],
  });
}

export const englishCurriculum = {
  roadmapSlug: 'english-communication',
  modules: englishModules,
  days: dayData.map((d) => ({
    dayNumber: d.dayNumber,
    moduleIndex: d.moduleIndex,
    title: d.title,
    objective: d.objective,
    estimatedStudyTime: 30,
    dayType: d.dayNumber % 7 === 0 ? 'assessment' : d.dayNumber % 3 === 0 ? 'practice' : 'learning',
    tasks: d.tasks.map((t, idx) => ({
      title: t.title,
      description: t.desc,
      taskType: t.type,
      estimatedDuration: t.dur,
      displayOrder: idx + 1,
    })),
  })),
};
