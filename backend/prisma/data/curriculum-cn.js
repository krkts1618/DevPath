// Computer Networks Curriculum (35 Days, 7 Modules)

const cnModules = [
  {
    title: 'Module 1: Network Fundamentals & Reference Models',
    description: 'LAN, MAN, WAN, network topologies, OSI 7-layer model, TCP/IP model, and protocol encapsulation/decapsulation.',
    startingDay: 1,
    endingDay: 5,
    displayOrder: 1,
  },
  {
    title: 'Module 2: Physical & Data Link Layers',
    description: 'Transmission media, framing, flow control, error detection (Parity, Checksum, CRC), MAC addressing, and Ethernet.',
    startingDay: 6,
    endingDay: 10,
    displayOrder: 2,
  },
  {
    title: 'Module 3: IPv4/IPv6 Addressing, Subnetting & CIDR',
    description: 'Classful addressing, subnet masks, CIDR prefix calculations, VLSM host design, ARP, and ICMP utilities.',
    startingDay: 11,
    endingDay: 15,
    displayOrder: 3,
  },
  {
    title: 'Module 4: Routing Algorithms, NAT & DHCP Services',
    description: 'Distance Vector, Link State routing (Dijkstra), Border Gateway Protocol (BGP), NAT IP translation, and DHCP leasing.',
    startingDay: 16,
    endingDay: 20,
    displayOrder: 4,
  },
  {
    title: 'Module 5: Transport Layer: TCP, UDP & Congestion Control',
    description: 'TCP 3-way handshake, connection termination, flow control (sliding window), congestion avoidance, and UDP sockets.',
    startingDay: 21,
    endingDay: 25,
    displayOrder: 5,
  },
  {
    title: 'Module 6: Application Layer Protocols: DNS, HTTP, TLS & WebSockets',
    description: 'DNS resolution tree, HTTP/1.1 vs HTTP/2 vs HTTP/3, TLS handshake, SMTP/POP3/IMAP, and bidirectional WebSockets.',
    startingDay: 26,
    endingDay: 30,
    displayOrder: 6,
  },
  {
    title: 'Module 7: Network Security, Wireshark Packet Analysis & Troubleshooting',
    description: 'Packet sniffing with Wireshark, firewalls, VPN tunnels, ping, traceroute, latency, throughput, and network debugging.',
    startingDay: 31,
    endingDay: 35,
    displayOrder: 7,
  },
];

const dayData = [];

for (let d = 1; d <= 35; d++) {
  const modIdx = Math.floor((d - 1) / 5);
  const titles = [
    'Network Fundamentals & Reference Models',
    'Physical & Data Link Layers',
    'IPv4/IPv6 Addressing, Subnetting & CIDR',
    'Routing Algorithms, NAT & DHCP Services',
    'Transport Layer: TCP, UDP & Congestion Control',
    'Application Layer Protocols: DNS, HTTP, TLS & WebSockets',
    'Network Security, Wireshark Packet Analysis & Troubleshooting',
  ];
  const modTitle = titles[modIdx];

  dayData.push({
    dayNumber: d,
    moduleIndex: modIdx,
    title: `Day ${d}: ${modTitle} - Part ${(d - 1) % 5 + 1}`,
    objective: `Master concepts, numerical problem solving, and practical packet traces for Day ${d} in ${modTitle}.`,
    tasks: [
      {
        title: `Study protocol specifications and architecture for Day ${d}`,
        desc: `Learn layer mechanics, protocol data units, and network standards for Day ${d}.`,
        type: 'learn',
        dur: 15,
      },
      {
        title: `Solve numerical subnetting/routing problems or capture packet traces for Day ${d}`,
        desc: `Calculate subnet masks, trace routing tables, or analyze packet captures using CLI tools.`,
        type: d % 5 === 0 ? 'project' : 'code',
        dur: 20,
      },
      {
        title: `Solve 5 placement MCQs and log errors for Day ${d}`,
        desc: `Review computer networks examination questions and note common protocol traps in study log.`,
        type: 'practice',
        dur: 10,
      },
    ],
  });
}

export const cnCurriculum = {
  roadmapSlug: 'computer-networks',
  modules: cnModules,
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
