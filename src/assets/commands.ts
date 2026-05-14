export const commands = {
    whoami: {
        output: "aymane belassiria - fullstack developer"
    },
    about: {
        output: "[i] about me:\n hey!!!👋\nI'm Aymane Belassiria, a fullstack web developer and trainer from Morocco\nwith expertise in JavaScript, Go, Java, and TypeScript.\n\nI've built 79+ open source projects ranging from cloud-native applications,\nblockchain systems, and MERN stack apps to domain-specific languages.\n\nKey expertise: React, Node.js, Spring Boot, Go, blockchain, DevOps (Docker, Ansible)\n\nUse 'show-projects' to see featured projects or 'help' for more commands!🎉",
        color: "green",
    },
    help: {
        output: `available commands:\n help        - show all commands\n about       - about me\n show-projects - featured projects\n experience  - work experience\n skills      - technical skills\n linkedin    - LinkedIn profile\n github      - GitHub profile\n email       - contact email\n whoami      - current user\n clear       - clear screen`,
    },
    experience: {
        output: "professional experience:\n Developer/Trainer - Building full-stack applications and training others\nMultiple technical roles with focus on: Backend (Java, Go, Node.js), Frontend (React, Vue), DevOps\n69 GitHub followers, 79 public repositories\n",
        color: "green",
    },
    skills: {
        output: "technical skills:\nLanguages: JavaScript, TypeScript, Java, Go, Python, Solidity, Rust, PHP\nFrontend: React, Vue, React Native, Angular, Next.js\nBackend: Node.js, Spring Boot, Express, Fastify\nDB/DevOps: MongoDB, PostgreSQL, Docker, Kubernetes, Ansible\nOther: GraphQL, REST APIs, Blockchain, Smart Contracts\n",
        color: "green",
    },
    linkedin: {
        output: "LinkedIn profile",
        color: "green",
        links: ["https://www.linkedin.com/in/aymane-belassiria/"],
    },
    email:{
        output: "contact email",
        color: "green",
        links: ["aymanebel2@outlook.fr"],
    },
    "show-projects": {
        output: "featured projects (79 total on GitHub):\n",
        color: "green",
        links: [
            "https://github.com/aymane-belassiria/Booky",
            "https://github.com/aymane-belassiria/tighalin",
            "https://github.com/aymane-belassiria/spring-resource",
            "https://github.com/aymane-belassiria/file-rouge",
            "https://github.com/aymane-belassiria/YouQuiz-NG",
            "https://github.com/aymane-belassiria/blockchain-js",
            "https://github.com/aymane-belassiria/uniswap-clone",
            "https://github.com/aymane-belassiria/9aleb",
        ],
    },
    github:{
        output: "GitHub profile - 79 public repos, 69 followers",
        color: "green",
        links: ["https://github.com/aymane-belassiria"],
    }
};