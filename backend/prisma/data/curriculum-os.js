// Operating Systems Curriculum (35 Days, 7 Modules)

const osModules = [
  {
    title: 'Module 1: OS Architecture, Kernel & System Calls',
    description: 'Core functions of an OS, dual-mode hardware operation, user vs kernel mode, trap mechanisms, and system calls.',
    startingDay: 1,
    endingDay: 5,
    displayOrder: 1,
  },
  {
    title: 'Module 2: Process Management, Threads & Concurrency',
    description: 'Process states, PCB, context switching overhead, fork() system call, multithreading models, and Java thread demo.',
    startingDay: 6,
    endingDay: 10,
    displayOrder: 2,
  },
  {
    title: 'Module 3: CPU Scheduling Algorithms & Numericals',
    description: 'FCFS, SJF, SRTF, Priority Scheduling, Round Robin, Gantt charts, turnaround time, waiting time, and CPU simulator.',
    startingDay: 11,
    endingDay: 15,
    displayOrder: 3,
  },
  {
    title: 'Module 4: Process Synchronization & Concurrency Problems',
    description: 'Critical section problem, race conditions, Peterson algorithm, mutexes, semaphores, monitors, and producer-consumer.',
    startingDay: 16,
    endingDay: 20,
    displayOrder: 4,
  },
  {
    title: 'Module 5: Deadlocks: Prevention, Avoidance & Recovery',
    description: 'Four Coffman conditions, resource allocation graphs, Deadlock Prevention, Bankers algorithm avoidance, and detection.',
    startingDay: 21,
    endingDay: 25,
    displayOrder: 5,
  },
  {
    title: 'Module 6: Memory Management, Paging & Virtual Memory',
    description: 'Contiguous allocation, internal/external fragmentation, paging, TLB, multi-level page tables, virtual memory, and demand paging.',
    startingDay: 26,
    endingDay: 30,
    displayOrder: 6,
  },
  {
    title: 'Module 7: Page Replacement, File Systems & Linux CLI',
    description: 'FIFO, LRU, Optimal algorithms, Belady anomaly, thrashing, disk scheduling (SSTF, SCAN), Linux file permissions, and CLI.',
    startingDay: 31,
    endingDay: 35,
    displayOrder: 7,
  },
];

const dayData = [
  // Module 1: Days 1-5
  {
    dayNumber: 1,
    moduleIndex: 0,
    title: 'OS Introduction, Evolution & Fundamental Functions',
    objective: 'Understand the operating system as resource allocator and extended virtual machine, and analyze OS types.',
    tasks: [
      { title: 'Study core functions and services of modern operating systems', desc: 'Examine process, memory, storage, device management, and user interface abstractions.', type: 'learn', dur: 15 },
      { title: 'Compare Monolithic, Microkernel, Layered, and Modular architectures', desc: 'Analyze microkernel fault isolation benefits vs monolithic performance advantages.', type: 'learn', dur: 15 },
      { title: 'Differentiate Batch, Time-Sharing, Distributed, and Real-Time systems', desc: 'Identify latency constraints in hard vs soft real-time operating systems.', type: 'practice', dur: 15 },
    ],
  },
  {
    dayNumber: 2,
    moduleIndex: 0,
    title: 'Kernel Architecture, Dual-Mode & Hardware Protection',
    objective: 'Analyze User Mode vs Kernel Mode, dual-mode CPU operation, and hardware protection mechanisms.',
    tasks: [
      { title: 'Study Dual-Mode Operation and the Mode Bit', desc: 'Understand transition from user mode (bit 1) to kernel mode (bit 0) via interrupts and traps.', type: 'learn', dur: 15 },
      { title: 'Examine Hardware Protection mechanisms', desc: 'Learn how Base/Limit registers prevent memory corruption and Timer interrupts prevent CPU monopoly.', type: 'learn', dur: 15 },
      { title: 'Trace mode switching execution flow with an architectural diagram', desc: 'Diagram user program invoking an instruction that triggers a hardware trap.', type: 'practice', dur: 15 },
    ],
  },
  {
    dayNumber: 3,
    moduleIndex: 0,
    title: 'System Calls, Trap Mechanism & Execution Flow',
    objective: 'Trace system call interface, system call table lookup, and key POSIX syscalls.',
    tasks: [
      { title: 'Study System Call mechanics vs standard library functions', desc: 'Analyze how libc wrappers (e.g., printf) invoke underlying write() system calls.', type: 'learn', dur: 15 },
      { title: 'Examine key Linux system calls: fork, exec, wait, read, write, open, close', desc: 'Understand parameter passing conventions via registers vs stack.', type: 'learn', dur: 15 },
      { title: 'Trace system call execution using strace in Linux terminal', desc: 'Run strace ls and inspect all system calls executed by the kernel.', type: 'practice', dur: 15 },
    ],
  },
  {
    dayNumber: 4,
    moduleIndex: 0,
    title: 'Interrupts, Traps & OS Booting Sequence',
    objective: 'Differentiate hardware vs software interrupts and understand BIOS/UEFI, GRUB, and kernel initialization.',
    tasks: [
      { title: 'Study Interrupt Handling: Interrupt Vector Table (IVT) and ISR', desc: 'Trace interrupt service routine invocation and register preservation.', type: 'learn', dur: 15 },
      { title: 'Examine OS Booting Sequence (BIOS/UEFI -> MBR/GPT -> GRUB -> Kernel)', desc: 'Understand init / systemd creation as PID 1 ancestor of all processes.', type: 'learn', dur: 15 },
      { title: 'Solve 5 placement MCQs on OS architecture and system calls', desc: 'Test conceptual clarity on mode switches and interrupt dispatch.', type: 'practice', dur: 15 },
    ],
  },
  {
    dayNumber: 5,
    moduleIndex: 0,
    title: 'Module 1 Assessment: OS Architecture & System Call Practical',
    objective: 'Assess understanding of kernel modes, syscall tracing, and write a system call program in C.',
    tasks: [
      { title: 'Write a C program invoking low-level read() and write() system calls', desc: 'Compile with gcc and verify file I/O operations without standard I/O library.', type: 'code', dur: 20 },
      { title: 'Complete Module 1 timed assessment (10 placement questions)', desc: 'Evaluate understanding of kernel architectures, hardware traps, and syscall interfaces.', type: 'assessment', dur: 25 },
    ],
  },

  // Module 2: Days 6-10
  {
    dayNumber: 6,
    moduleIndex: 1,
    title: 'Process Concept & Process Memory Layout',
    objective: 'Analyze process abstractions, memory segments (Text, Data, BSS, Heap, Stack), and process states.',
    tasks: [
      { title: 'Study Process Memory Layout (Text, Data, BSS, Heap, Stack)', desc: 'Understand growth directions (Heap grows up, Stack grows down) and stack frames.', type: 'learn', dur: 15 },
      { title: 'Master 5-State Process Model (New, Ready, Running, Waiting, Terminated)', desc: 'Draw and explain state transition triggers (I/O wait, timer interrupt, completion).', type: 'learn', dur: 15 },
      { title: 'Inspect running Linux process memory maps via /proc/[pid]/maps', desc: 'Examine virtual memory addresses of heap, stack, and loaded shared libraries.', type: 'practice', dur: 15 },
    ],
  },
  {
    dayNumber: 7,
    moduleIndex: 1,
    title: 'Process Control Block (PCB) & Context Switching',
    objective: 'Understand PCB structure, CPU register preservation, and calculate context switch overhead.',
    tasks: [
      { title: 'Study Process Control Block (PCB) data structure fields', desc: 'Inspect PID, Program Counter, CPU registers, scheduling info, and open file descriptors.', type: 'learn', dur: 15 },
      { title: 'Analyze Context Switching mechanics and CPU state restoration', desc: 'Trace the exact steps the OS scheduler takes to swap process execution.', type: 'learn', dur: 15 },
      { title: 'Calculate context switch overhead on effective CPU throughput', desc: 'Solve numerical problems evaluating CPU efficiency under frequent context switches.', type: 'practice', dur: 15 },
    ],
  },
  {
    dayNumber: 8,
    moduleIndex: 1,
    title: 'Process Creation: fork(), exec(), wait() & Process Trees',
    objective: 'Understand fork() copy-on-write semantics, exec() address space replacement, and zombie/orphan states.',
    tasks: [
      { title: 'Master fork(), exec(), and wait() system calls in Linux', desc: 'Understand return values of fork() (0 in child, child PID in parent, -1 on failure).', type: 'learn', dur: 15 },
      { title: 'Analyze Zombie processes and Orphan processes with code examples', desc: 'Observe zombie state when parent fails to call wait() and adoption by init/systemd.', type: 'code', dur: 15 },
      { title: 'Write a C program creating a hierarchy of 4 processes with fork()', desc: 'Trace PID outputs and verify exact execution order using wait().', type: 'practice', dur: 15 },
    ],
  },
  {
    dayNumber: 9,
    moduleIndex: 1,
    title: 'Threads vs Processes & Multithreading Models',
    objective: 'Compare thread memory sharing vs process isolation, and analyze multithreading mapping models.',
    tasks: [
      { title: 'Contrast Threads and Processes (Address space, IPC vs shared memory)', desc: 'Understand why thread creation and context switching are significantly faster than processes.', type: 'learn', dur: 15 },
      { title: 'Study Multithreading Models: Many-to-One, One-to-One, Many-to-Many', desc: 'Evaluate kernel thread blocking impact and CPU core concurrency per model.', type: 'learn', dur: 15 },
      { title: 'Practical: Implement Multi-threaded Java program demonstration', desc: 'Create worker threads implementing Runnable, observe concurrent outputs, and join threads.', type: 'code', dur: 15 },
    ],
  },
  {
    dayNumber: 10,
    moduleIndex: 1,
    title: 'Inter-Process Communication (IPC): Pipes, Shared Memory & Sockets',
    objective: 'Understand IPC mechanisms: anonymous pipes, named pipes (FIFO), shared memory, and message queues.',
    tasks: [
      { title: 'Study IPC models: Shared Memory vs Message Passing', desc: 'Analyze throughput, synchronization overhead, and kernel involvement per model.', type: 'learn', dur: 15 },
      { title: 'Implement IPC using anonymous pipe in Linux (pipe() and fork())', desc: 'Send data from child process to parent process via file descriptors.', type: 'code', dur: 15 },
      { title: 'Complete Module 2 Quiz: Process lifecycles, threads, and IPC', desc: 'Solve 8 interview problems on process state transitions and fork output prediction.', type: 'assessment', dur: 15 },
    ],
  },
];

// Generate days 11 to 35
for (let d = 11; d <= 35; d++) {
  const modIdx = Math.floor((d - 1) / 5);
  const titles = [
    'CPU Scheduling Algorithms & Numericals', // Mod 3 (11-15)
    'Process Synchronization & Concurrency Problems', // Mod 4 (16-20)
    'Deadlocks: Prevention, Avoidance & Recovery', // Mod 5 (21-25)
    'Memory Management, Paging & Virtual Memory', // Mod 6 (26-30)
    'Page Replacement, File Systems & Linux CLI', // Mod 7 (31-35)
  ];
  const modTitle = titles[modIdx - 2];

  dayData.push({
    dayNumber: d,
    moduleIndex: modIdx,
    title: `Day ${d}: ${modTitle} - Part ${(d - 1) % 5 + 1}`,
    objective: `Master concepts, numerical problem solving, and practical exercises for Day ${d} in ${modTitle}.`,
    tasks: [
      {
        title: `Study theory and formal algorithms for Day ${d}`,
        desc: `Learn theoretical principles, mathematical definitions, and edge cases in ${modTitle}.`,
        type: 'learn',
        dur: 15,
      },
      {
        title: `Solve placement numerical problems or write practical code for Day ${d}`,
        desc: `Construct Gantt charts, run simulation scripts, or trace algorithmic state transitions.`,
        type: d % 5 === 0 ? 'project' : 'code',
        dur: 20,
      },
      {
        title: `Review errors, summarize formulas, and solve 5 MCQs for Day ${d}`,
        desc: `Reinforce concepts, identify common examination traps, and update study error journal.`,
        type: 'practice',
        dur: 10,
      },
    ],
  });
}

export const osCurriculum = {
  roadmapSlug: 'operating-systems',
  modules: osModules,
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
