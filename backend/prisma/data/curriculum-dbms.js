// DBMS Foundations Curriculum (35 Days, 7 Modules)

const dbmsModules = [
  {
    title: 'Module 1: DBMS Architecture & Three-Schema Framework',
    description: 'File Systems vs DBMS, physical/logical data independence, schemas, instances, and database administrator roles.',
    startingDay: 1,
    endingDay: 5,
    displayOrder: 1,
  },
  {
    title: 'Module 2: ER Modeling & Relational Algebra Theory',
    description: 'Entity sets, relationship cardinalities, weak entities, keys, and Relational Algebra fundamental/extended operators.',
    startingDay: 6,
    endingDay: 10,
    displayOrder: 2,
  },
  {
    title: 'Module 3: SQL Fundamentals, DDL, DML & Group Aggregations',
    description: 'Core SQL queries, logical query processing order, GROUP BY, HAVING, and aggregate function numericals.',
    startingDay: 11,
    endingDay: 15,
    displayOrder: 3,
  },
  {
    title: 'Module 4: Joins, Subqueries, Views & Procedural SQL',
    description: 'Theta/natural joins, correlated subqueries, updatable views, triggers, and stored procedure fundamentals.',
    startingDay: 16,
    endingDay: 20,
    displayOrder: 4,
  },
  {
    title: 'Module 5: Functional Dependencies & Normalization Theory',
    description: 'Attribute closures, minimal covers, candidate key discovery, 1NF-BCNF decomposition, and dependency preservation.',
    startingDay: 21,
    endingDay: 25,
    displayOrder: 5,
  },
  {
    title: 'Module 6: Transactions, ACID & Concurrency Control',
    description: 'Conflict serializability, precedence graphs, recoverable schedules, lock protocols (2PL), and deadlocks.',
    startingDay: 26,
    endingDay: 30,
    displayOrder: 6,
  },
  {
    title: 'Module 7: Recovery, Query Optimization, B+ Trees & NoSQL',
    description: 'Log-based recovery, WAL, checkpoints, query cost calculation, B+ Tree indexing, and NoSQL key-value/document stores.',
    startingDay: 31,
    endingDay: 35,
    displayOrder: 7,
  },
];

const dayData = [];

for (let d = 1; d <= 35; d++) {
  const modIdx = Math.floor((d - 1) / 5);
  const titles = [
    'DBMS Architecture & Three-Schema Framework',
    'ER Modeling & Relational Algebra Theory',
    'SQL Fundamentals, DDL, DML & Group Aggregations',
    'Joins, Subqueries, Views & Procedural SQL',
    'Functional Dependencies & Normalization Theory',
    'Transactions, ACID & Concurrency Control',
    'Recovery, Query Optimization, B+ Trees & NoSQL',
  ];
  const modTitle = titles[modIdx];

  dayData.push({
    dayNumber: d,
    moduleIndex: modIdx,
    title: `Day ${d}: ${modTitle} - Part ${(d - 1) % 5 + 1}`,
    objective: `Master theoretical concepts, formal proofs, and placement examination questions for Day ${d} in ${modTitle}.`,
    tasks: [
      {
        title: `Study theoretical concepts and definitions for Day ${d}`,
        desc: `Learn database management system theories, formal notations, and mathematical foundations for Day ${d}.`,
        type: 'learn',
        dur: 15,
      },
      {
        title: `Solve formal problems, query exercises, or proof derivations for Day ${d}`,
        desc: `Derive candidate keys, construct precedence graphs, or write relational algebra expressions.`,
        type: d % 5 === 0 ? 'project' : 'code',
        dur: 20,
      },
      {
        title: `Solve 5 placement MCQs and review error log for Day ${d}`,
        desc: `Practice placement multiple-choice questions on GATE/campus interview database topics.`,
        type: 'practice',
        dur: 10,
      },
    ],
  });
}

export const dbmsCurriculum = {
  roadmapSlug: 'dbms',
  modules: dbmsModules,
  days: dayData.map((d) => ({
    dayNumber: d.dayNumber,
    moduleIndex: d.moduleIndex,
    title: d.title,
    objective: d.objective,
    estimatedStudyTime: 45,
    dayType: d.dayNumber % 5 === 0 ? 'assessment' : d.dayNumber % 2 === 0 ? 'practice' : 'learning',
    tasks: d.tasks.map((t, idx) => ({
      title: t.title,
      description: t.desc,
      taskType: t.type,
      estimatedDuration: t.dur,
      displayOrder: idx + 1,
    })),
  })),
};
