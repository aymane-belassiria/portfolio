// Single source of truth for portfolio content.
// All file viewers, terminal aliases, and the filesystem read from this module.

export type Experience = {
  slug: string;
  company: string;
  role: string;
  type: string;
  location: string;
  period: string;
  summary: string;
  bullets: string[];
  stack: string[];
  website?: string;
};

export type Education = {
  slug: string;
  degree: string;
  school: string;
  location: string;
  period: string;
};

export type Project = {
  slug: string;
  name: string;
  description: string;
  stack: string[];
  status: 'done' | 'in-progress' | 'discontinued';
  stars: number;
  repo?: string;
  highlight: string;
};

export type Skills = {
  languages: string[];
  frontend: string[];
  backend: string[];
  devops: string[];
  tools: string[];
};

export type Contact = {
  name: string;
  email: string;
  linkedin: string;
  github: string;
  location: string;
};

export const contact: Contact = {
  name: 'Aymane Belassiria',
  email: 'aymanebel2@outlook.fr',
  linkedin: 'https://www.linkedin.com/in/aymane-belassiria/',
  github: 'https://github.com/aymane-belassiria',
  location: 'Morocco',
};

export const about = `Experienced Full-Stack Developer skilled in Golang, JavaScript, and Rust.
Proficient in React.js, Angular, and Spring Boot, with expertise in microservices
architecture, Docker, and CI/CD pipelines. Strong background in API development and
database management.

Passionate about building scalable, high-performance applications, contributing to
open-source projects, and currently learning and implementing Generative AI, AI
agents, and Rust to solve real-world problems.

79+ public repositories on GitHub, with work spanning cloud-native applications,
blockchain systems, custom programming languages, and DevOps tooling.`;

export const skills: Skills = {
  languages: ['Java', 'JavaScript', 'TypeScript', 'GoLang', 'Rust', 'PHP', 'SQL', 'Solidity'],
  frontend: ['React.js', 'Angular', 'Next.js', 'Vue.js'],
  backend: ['Spring Boot', 'Express.js', 'Hibernate', 'JUnit'],
  devops: ['Docker', 'Kubernetes', 'Ansible', 'GitHub Actions', 'PostgreSQL', 'AWS'],
  tools: ['Cursor', 'VSCode', 'IntelliJ', 'Claude Code'],
};

export const experience: Experience[] = [
  {
    slug: 'polymorpho',
    company: 'Polymorpho',
    role: 'GoLang Developer',
    type: 'full-time',
    location: 'Rabat, Morocco (on-site)',
    period: '08/2025 - Current',
    summary:
      'Building a platform that helps companies stress-test their websites using DDoS attacks (like DDosia).',
    bullets: [
      'Responsible for building the whole backend/infrastructure using best practices.',
      'Documented projects and provided the frontend team with the required APIs for web client-side integration.',
      'Participated in project management using the Agile framework.',
      'Wrote attack payloads for bot/agent use cases.',
      'Adopted a secure-by-design approach and collaborated with the security team.',
      'Developed a custom communication protocol based on research from the security team.',
      'Adopted the monorepo architecture for the project.',
      "Created binaries based on the machine's CPU architectures.",
      'Used Wails to build the GUI of the desktop solutions.',
      'Wrote, audited, and optimized smart contracts for the project use cases.',
      'Used Railgun and ZK-proofs to ensure the anonymity of transactions between agents.',
      'Side: a custom Rust-based web crawler and scraper (discontinued).',
    ],
    stack: [
      'Go',
      'Wails',
      'Docker',
      'Monorepo',
      'Smart Contracts',
      'Railgun',
      'ZK-proofs',
      'Rust',
      'Agile',
    ],
  },
  {
    slug: 'youcode',
    company: 'YouCode',
    role: 'Full Stack Developer',
    type: 'full-time',
    location: 'Safi, Morocco (on-site)',
    period: '09/2024 - 08/2025',
    summary:
      'Built an internal coding-challenges platform (LeetCode/HackerRank style) and an internal AI agent.',
    bullets: [
      'Coding-challenges platform: Go service talking to Docker via the Docker SDK to execute and extract submission results.',
      'Kubernetes for orchestration of the execution containers.',
      'React.js + TypeScript frontend, Spring Boot backend.',
      'GitHub Actions for CI/CD on VPS; Ansible for VPS automation.',
      'Project management with Jira.',
      'Spring AI for AI integration in the platform.',
      'Maintained a legacy project written in native PHP.',
      'Internal AI agent: Jupyter for collaborative development, Langchain for document processing.',
      'Gradio for prebuilt components to accelerate prototyping.',
      'RAG + vector DB to feed the LLM with the needed data.',
    ],
    stack: [
      'Go',
      'Docker SDK',
      'Kubernetes',
      'React.js',
      'TypeScript',
      'Spring Boot',
      'Spring AI',
      'Ansible',
      'GitHub Actions',
      'Jupyter',
      'Langchain',
      'RAG',
      'Vector DB',
      'PHP',
    ],
  },
  {
    slug: 'quipnex',
    company: 'Quipnex',
    role: 'Full Stack Developer',
    type: 'part-time',
    location: 'Slovenia (remote)',
    period: '02/2024 - 09/2024',
    summary: 'Frontend and backend work on a production product, plus a major Angular migration.',
    bullets: [
      'New features in the frontend (Angular) and the backend (Spring Boot).',
      'Fixed bugs and performance issues in the frontend.',
      'Migrated the application from Angular 15 to Angular 18.',
      'Project management with Jira and Bitbucket.',
    ],
    stack: ['Angular', 'Spring Boot', 'Bitbucket', 'Jira'],
  },
  {
    slug: 'ocp',
    company: 'OCP Maintenance Solutions',
    role: 'Full Stack Developer',
    type: 'internship',
    location: 'Safi, Morocco (hybrid)',
    period: '06/2024 - 09/2024',
    summary: 'Laravel/React full-stack work focused on the frontend and a Webpack-to-Vite migration.',
    bullets: [
      'API integration for the application dashboard, optimizing UX.',
      'UI implementation directly from Figma; helped improve application architecture.',
      'Maintained the old version in native PHP and participated in the migration to Laravel.',
      'Data manipulation for chart display.',
      'Migrated the frontend build from Webpack to Vite.',
      'Dockerized the frontend and optimized the image. Project management with Jira.',
    ],
    stack: ['Laravel', 'React.js', 'PHP', 'Vite', 'Docker', 'Figma'],
  },
  {
    slug: 'sahwa',
    company: 'Sahwa (open source)',
    role: 'Full Stack Developer',
    type: 'volunteer',
    location: 'USA (remote)',
    period: '05/2024 - Current',
    summary:
      'Open-source learning platform helping Palestinian students continue their education online after war-interrupted studies.',
    bullets: [
      'Securing the open-source project and making architectural decisions.',
      'Working with Next.js on the frontend.',
      'Project management with ClickUp.',
    ],
    stack: ['Next.js', 'TypeScript', 'Open Source', 'Security'],
  },
  {
    slug: 'mchain',
    company: 'Mchain',
    role: 'Back-end Developer',
    type: 'internship',
    location: 'Rabat, Morocco (remote)',
    period: '05/2023 - 08/2023',
    summary: 'Trading platform built on HyperLedger Fabric.',
    bullets: [
      'Inter-service communication with gRPC; dockerized the whole system.',
      'Platform optimization via load-balancing and code optimization.',
      'Data visualization with Metabase, RabbitMQ clustering, database coupling, component testing.',
      'Wrote HyperLedger smart contracts using the JavaScript SDK.',
      'CI configuration via GitHub Actions; project management on GitHub Projects.',
    ],
    stack: [
      'HyperLedger Fabric',
      'gRPC',
      'Docker',
      'RabbitMQ',
      'Metabase',
      'GitHub Actions',
      'JavaScript',
    ],
  },
  {
    slug: 'kipinia',
    company: 'Kipinia',
    role: 'Full-Stack Developer',
    type: 'freelance',
    location: 'Casablanca, Morocco (remote)',
    period: '06/2021 - 10/2021',
    summary: 'Custom ERP built end-to-end for Kipina, its clients, and staff.',
    bullets: [
      'Responsible for building the whole ERP and matching client/staff needs.',
      'Deployed on Heroku; handled SSL, domain, and monitoring.',
      'MongoDB Atlas for data storage.',
      'Frontend with EJS, jQuery, and Bootstrap.',
      'Backend with Node.js / Express.js.',
      'Project management with Trello.',
    ],
    stack: ['Node.js', 'Express.js', 'MongoDB Atlas', 'EJS', 'jQuery', 'Bootstrap', 'Heroku'],
  },
];

export const education: Education[] = [
  {
    slug: 'youcode',
    degree: 'Web & Mobile Development',
    school: 'YouCode',
    location: 'Safi, Morocco',
    period: '09/2022 - 04/2024',
  },
  {
    slug: 'cadi-ayyad',
    degree: 'Bachelor of Computer Science',
    school: 'Université Cadi-Ayyad',
    location: 'Safi, Morocco',
    period: '09/2018 - 06/2021',
  },
];

export const projects: Project[] = [
  {
    slug: 'booky',
    name: 'Booky',
    description:
      'A simple cloud-native application built in Go for learning purposes. Covers containerization, deployment, and Go idioms.',
    stack: ['Go', 'Docker', 'Cloud-Native'],
    status: 'done',
    stars: 10,
    repo: 'https://github.com/aymane-belassiria/Booky',
    highlight: 'Most-starred repo — hands-on cloud-native Go.',
  },
  {
    slug: 'tighalin',
    name: 'tighalin',
    description:
      'A custom programming language interpreted by Go. Lexer, parser, evaluator — all hand-rolled.',
    stack: ['Go', 'Interpreter', 'Language Design'],
    status: 'done',
    stars: 9,
    repo: 'https://github.com/aymane-belassiria/tighalin',
    highlight: 'I built a programming language from scratch in Go.',
  },
  {
    slug: 'spring-resource',
    name: 'spring-resource',
    description:
      'CLI for Spring Boot that generates project resources automatically — controllers, services, DTOs.',
    stack: ['Go', 'Spring Boot', 'CLI'],
    status: 'done',
    stars: 8,
    repo: 'https://github.com/aymane-belassiria/spring-resource',
    highlight: 'Go CLI that scaffolds Spring Boot resources — used in real projects.',
  },
  {
    slug: 'file-rouge',
    name: 'file-rouge',
    description:
      'End-of-studies project. A platform managing relationships between companies, employees, and restaurants.',
    stack: ['PHP', 'MySQL'],
    status: 'done',
    stars: 7,
    repo: 'https://github.com/aymane-belassiria/file-rouge',
    highlight: 'Full multi-tenant platform for company meal management.',
  },
  {
    slug: 'docker-workshop',
    name: 'docker-workshop',
    description: 'Docker handbook + workshop materials for YouCoders.',
    stack: ['Docker', 'Teaching'],
    status: 'done',
    stars: 6,
    repo: 'https://github.com/aymane-belassiria/docker-workshop',
    highlight: 'Teaching material I authored and ran for the YouCode community.',
  },
  {
    slug: 'youquiz-ng',
    name: 'YouQuiz-NG',
    description: 'Angular UI implementation for the YouQuiz API, following the Kahoot design system.',
    stack: ['Angular', 'TypeScript'],
    status: 'done',
    stars: 3,
    repo: 'https://github.com/aymane-belassiria/YouQuiz-NG',
    highlight: 'Kahoot-style quiz platform UI.',
  },
  {
    slug: 'dalle-clone',
    name: 'dall.e-clone',
    description: 'Cloning the dall.e website/mobile application using React.js / Vue.js.',
    stack: ['React.js', 'Vue.js', 'TypeScript'],
    status: 'done',
    stars: 2,
    repo: 'https://github.com/aymane-belassiria/dall.e-clone',
    highlight: 'AI-image gallery clone — cross-framework.',
  },
  {
    slug: 'monsalonline',
    name: 'MonSalonline',
    description:
      'Website for barbers to help them schedule appointments with their clients.',
    stack: ['Vue.js'],
    status: 'done',
    stars: 2,
    repo: 'https://github.com/aymane-belassiria/MonSalonline',
    highlight: 'Real-world scheduling SaaS for barbers.',
  },
  {
    slug: 'go-contractor',
    name: 'go-contractor',
    description: 'Governing data contracts between teams easily.',
    stack: ['Go'],
    status: 'in-progress',
    stars: 1,
    repo: 'https://github.com/aymane-belassiria/go-contractor',
    highlight: 'Data-contract governance for cross-team APIs.',
  },
  {
    slug: 'rust-mini-projects',
    name: 'rust-mini-projects',
    description: "Following the 'Rust Mini Projects Zero To Production' course.",
    stack: ['Rust'],
    status: 'in-progress',
    stars: 1,
    repo: 'https://github.com/aymane-belassiria/rust-mini-projects',
    highlight: 'Currently learning Rust — practical projects, not toy examples.',
  },
  {
    slug: 'blockchain-js',
    name: 'blockchain-js',
    description: 'Creating a blockchain network using vanilla JavaScript.',
    stack: ['JavaScript'],
    status: 'done',
    stars: 1,
    repo: 'https://github.com/aymane-belassiria/blockchain-js',
    highlight: 'Blockchain fundamentals built from zero — no libraries.',
  },
  {
    slug: 'youstream',
    name: 'YouStream',
    description: 'A live streaming application using Spring Boot.',
    stack: ['Java', 'Spring Boot'],
    status: 'done',
    stars: 1,
    repo: 'https://github.com/aymane-belassiria/YouStream',
    highlight: 'Live streaming pipeline built on Spring Boot.',
  },
  {
    slug: 'uniswap-clone',
    name: 'uniswap-clone',
    description: 'Cloning Uniswap using GraphQL, Solidity, and React.',
    stack: ['React.js', 'GraphQL', 'Solidity'],
    status: 'done',
    stars: 0,
    repo: 'https://github.com/aymane-belassiria/uniswap-clone',
    highlight: 'Full DEX clone — smart contracts + indexer + UI.',
  },
  {
    slug: 'nft-mint',
    name: 'nft-mint',
    description: 'A site for minting NFTs, built on Solidity.',
    stack: ['Solidity', 'Web3'],
    status: 'done',
    stars: 0,
    repo: 'https://github.com/aymane-belassiria/nft-mint',
    highlight: 'NFT minting dapp — end-to-end.',
  },
  {
    slug: 'rust-crawler',
    name: 'Rust Web Crawler & Scraper',
    description:
      'Custom Rust-based web crawler and scraper, built internally at Polymorpho. Discontinued in favor of other priorities.',
    stack: ['Rust'],
    status: 'discontinued',
    stars: 0,
    highlight: 'Internal Polymorpho project — Rust crawler/scraper.',
  },
];
