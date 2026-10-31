// Aptitude + Logical Reasoning Curriculum (84 Days, 12 Modules)

const aptitudeModules = [
  {
    title: 'Module 1: Percentages, Fractions, Decimals & Series',
    description: 'BODMAS rules, fraction-to-percentage conversions, successive percentage changes, and number/alphabet series.',
    startingDay: 1,
    endingDay: 7,
    displayOrder: 1,
  },
  {
    title: 'Module 2: Ratios, Proportions & Coding-Decoding',
    description: 'Compound ratios, mean/third/fourth proportions, variation formulas, and letter/symbol cipher coding.',
    startingDay: 8,
    endingDay: 14,
    displayOrder: 2,
  },
  {
    title: 'Module 3: Averages, Ages, Directions & Blood Relations',
    description: 'Weighted averages, linear equations for ages, cardinal direction sense, and family tree relationship deduction.',
    startingDay: 15,
    endingDay: 21,
    displayOrder: 3,
  },
  {
    title: 'Module 4: Profit, Loss, Discounts, Ranking & Ordering',
    description: 'Cost/selling price formulas, markup and successive discounts, position rankings, and sequential ordering.',
    startingDay: 22,
    endingDay: 28,
    displayOrder: 4,
  },
  {
    title: 'Module 5: Simple Interest, Compound Interest & Syllogisms',
    description: 'SI/CI calculations, compound difference formulas, and Venn diagram categorical deduction syllogisms.',
    startingDay: 29,
    endingDay: 35,
    displayOrder: 5,
  },
  {
    title: 'Module 6: Time & Work, Pipes & Cisterns, Seating Arrangements',
    description: 'Unitary work efficiency, inlet/outlet filling rates, and linear/parallel seating arrangement puzzles.',
    startingDay: 36,
    endingDay: 42,
    displayOrder: 6,
  },
  {
    title: 'Module 7: Speed, Distance, Trains & Circular Arrangements',
    description: 'Relative speed of trains, platform crossings, upstream/downstream boats, and circular table puzzles.',
    startingDay: 43,
    endingDay: 49,
    displayOrder: 7,
  },
  {
    title: 'Module 8: Number Systems, Divisibility, HCF, LCM & Critical Reasoning',
    description: 'Divisibility rules, prime factorization, statement-conclusion analysis, and implicit assumption evaluation.',
    startingDay: 50,
    endingDay: 56,
    displayOrder: 8,
  },
  {
    title: 'Module 9: Algebra, Linear Equations & Data Sufficiency',
    description: 'Algebraic identities, quadratic roots, system of equations, and data sufficiency statement analysis.',
    startingDay: 57,
    endingDay: 63,
    displayOrder: 9,
  },
  {
    title: 'Module 10: Permutations, Combinations, Probability, Clocks & Calendars',
    description: 'Counting principles, conditional probability, clock hand angle calculations, and calendar odd days.',
    startingDay: 64,
    endingDay: 70,
    displayOrder: 10,
  },
  {
    title: 'Module 11: Data Interpretation & Complex Reasoning Puzzles',
    description: 'Tabular data, bar graphs, pie charts, line trends, and multi-variable analytical logic puzzles.',
    startingDay: 71,
    endingDay: 77,
    displayOrder: 11,
  },
  {
    title: 'Module 12: Comprehensive Placement Mocks & Speed Drills',
    description: 'Full-length quantitative and reasoning timed mock assessments, weak-topic remediation, and error analysis.',
    startingDay: 78,
    endingDay: 84,
    displayOrder: 12,
  },
];

const dayData = [];

for (let d = 1; d <= 84; d++) {
  const modIdx = Math.floor((d - 1) / 7);
  const isTimedPractice = d % 7 === 6;
  const isWeeklyAssessment = d % 7 === 0;

  const titles = [
    'Percentages, Fractions, Decimals & Series',
    'Ratios, Proportions & Coding-Decoding',
    'Averages, Ages, Directions & Blood Relations',
    'Profit, Loss, Discounts, Ranking & Ordering',
    'Simple Interest, Compound Interest & Syllogisms',
    'Time & Work, Pipes & Cisterns, Seating Arrangements',
    'Speed, Distance, Trains & Circular Arrangements',
    'Number Systems, Divisibility, HCF, LCM & Critical Reasoning',
    'Algebra, Linear Equations & Data Sufficiency',
    'Permutations, Combinations, Probability, Clocks & Calendars',
    'Data Interpretation & Complex Reasoning Puzzles',
    'Comprehensive Placement Mocks & Speed Drills',
  ];
  const modTitle = titles[modIdx];

  dayData.push({
    dayNumber: d,
    moduleIndex: modIdx,
    title: `Day ${d}: ${modTitle} - Session ${(d - 1) % 7 + 1}`,
    objective: `Complete 30-minute structured aptitude session on ${modTitle} with problem practice and error logging.`,
    tasks: [
      {
        title: isWeeklyAssessment
          ? `Weekly Aptitude Assessment: 10 timed questions for Week ${modIdx + 1}`
          : isTimedPractice
          ? `Timed Speed Drill: 7 questions under 15-minute timer`
          : `Study formula concepts and shortcuts for Day ${d}`,
        desc: isWeeklyAssessment
          ? `Complete full 20-minute timed mock covering all topics of Week ${modIdx + 1}.`
          : isTimedPractice
          ? `Solve 7 mixed questions under strict timer without pauses to build exam speed.`
          : `Review shortcut formulas, mental calculation tricks, and pattern recognition rules.`,
        type: isWeeklyAssessment ? 'assessment' : isTimedPractice ? 'practice' : 'learn',
        dur: isWeeklyAssessment ? 20 : 10,
      },
      {
        title: isWeeklyAssessment
          ? `Review mock exam performance and log questions taking >90 seconds`
          : isTimedPractice
          ? `Analyze mistakes and log incorrect question patterns`
          : `Solve 5 targeted practice questions with full steps`,
        desc: `Verify mathematical steps, identify calculation errors, and record traps in error journal.`,
        type: 'practice',
        dur: isWeeklyAssessment ? 10 : 15,
      },
      {
        title: `Update daily error journal and review formula flashcards`,
        desc: `Maintain active error tracking log and review recurring formula cards for 5 minutes.`,
        type: 'revise',
        dur: 5,
      },
    ],
  });
}

export const aptitudeCurriculum = {
  roadmapSlug: 'aptitude-logical-reasoning',
  modules: aptitudeModules,
  days: dayData.map((d) => ({
    dayNumber: d.dayNumber,
    moduleIndex: d.moduleIndex,
    title: d.title,
    objective: d.objective,
    estimatedStudyTime: 30,
    dayType: d.dayNumber % 7 === 0 ? 'assessment' : d.dayNumber % 7 === 6 ? 'practice' : 'learning',
    tasks: d.tasks.map((t, idx) => ({
      title: t.title,
      description: t.desc,
      taskType: t.type,
      estimatedDuration: t.dur,
      displayOrder: idx + 1,
    })),
  })),
};
