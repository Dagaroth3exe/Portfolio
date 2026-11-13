/**
 * All site copy lives here so it can be updated without touching layout code.
 *
 * Every fact below comes from the previous version of the portfolio.
 * Anything that still needs the owner's input is tracked in CONTENT_NOTES.md —
 * nothing on the live site is a placeholder.
 */

export const person = {
  name: "Rishabh Parashar",
  first: "Rishabh",
  last: "Parashar",
  role: "AI Engineer",
  location: "Noida, Uttar Pradesh, India",
  email: "rishabh3501@gmail.com",
  status: "Open to opportunities",
  socials: [
    { label: "GitHub", href: "https://github.com/Dagaroth3exe" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/rishabh-parashar-95440521a/" },
  ],
};

export const hero = {
  kicker: "AI Engineer · LLMs · Voice · Computer vision",
  /** Sector 3 is an easter egg: MV's hunting ground + his race number */
  kickerTag: "Sector 3",
  statement: ["Build AI", "that actually", "ships."],
  sub: "On-premise LLM agents, multilingual voice pipelines, and computer vision — from evaluation sets and benchmarks to QA and production. No cloud escape hatch.",
  /** Short proof points shown under the hero — each one checkable. */
  proof: [
    { label: "Now", value: "AI Intern, DJT" },
    { label: "Focus", value: "LLMs · Voice · Vision" },
    { label: "GitHub", value: "@Dagaroth3exe", href: "https://github.com/Dagaroth3exe" },
  ],
};

/** The through-line: one idea that connects the roles and projects. */
export const thesis = {
  title: "I make AI work where it's hard: on-premise, multilingual, in production.",
  body: [
    "Most of my recent work runs on company hardware, with no cloud AI and no data leaving the network. That means small local models (Qwen via Ollama), tool calling instead of free-form chat, and evaluation sets, fallbacks and load tests so the system holds up when people actually use it.",
    "At DJT that covered language, voice and vision: VaultAI, a voice and text agent for a secure document vault; a Hindi/English assistant that answers rural borrowers' loan questions from live records; a face-attendance system for a microfinance app; fine-tuning experiments with model soups; and a support chatbot moved from regex to a hybrid intent + LLM model. I can build the interface too, but the model behind it is where I spend my time.",
  ],
  stats: [
    { value: "5", caption: "AI systems built or improved in one internship: agents, voice, vision, fine-tuning" },
    { value: "3", caption: "languages in my voice pipelines: English, Hindi and Hinglish" },
    { value: "99%", caption: "command accuracy on VaultAI's 99-command evaluation set" },
  ],
};

export const about = {
  title: ["Engineered", "for the", "straights &", "the corners."],
  lede: "I treat every model like a setup sheet: measure it, tune it, shave the latency, go again.",
  body: [
    "My focus is applied AI: LLM agents that call tools, speech pipelines (faster-whisper, IndicConformer, Piper, Kokoro) that work in Hindi and Hinglish as well as English, and computer vision for face recognition. I care about the unglamorous parts that make it usable — evaluation sets, benchmarks, fallbacks, and getting models to run well on the hardware you actually have.",
    "I came to AI through product work. I've built React, Next.js and React Native apps and n8n and Make automations, so I know what the model has to plug into, and I can build that interface myself when it's needed.",
  ],
  interests: [
    {
      label: "Motorsport",
      /** #33 → #1 is an easter egg: Verstappen's number before and after his first championship */
      aside: "#33 → #1",
      text: "Race weekends are where I study systems under pressure — pit stops are the best UX choreography on Earth.",
    },
    {
      label: "Evals",
      text: "If it isn't measured, it isn't better. Every model change I make comes with a benchmark or an eval set.",
    },
    {
      label: "Motion",
      text: "Motion is information. I use it to explain hierarchy and cause-and-effect, not to decorate.",
    },
    {
      label: "Experiments",
      text: "Agents, automations and small WebGL toys — the playground is where new ideas get their first laps.",
    },
  ] as { label: string; aside?: string; text: string }[],
  facts: [
    ["Base", "Noida, IN"],
    ["Focus", "LLMs · Voice · Vision"],
    ["Education", "BCA — BIT Mesra"],
    ["Status", "Open to opportunities"],
  ] as [string, string][],
};

export const toolbox: { group: string; items: string[] }[] = [
  {
    group: "LLMs & Agents",
    items: ["Ollama (Qwen3-4B, Qwen 2.5)", "Gemini", "Tool calling / agents", "Hybrid intent + LLM", "Prompt engineering", "Claude Code"],
  },
  {
    group: "Voice & Vision",
    items: ["faster-whisper", "AI4Bharat IndicConformer", "Piper / Kokoro TTS", "Wake-word detection", "Face recognition (Antelope v2)", "Blur, lighting & multi-face checks"],
  },
  {
    group: "Model R&D & Evals",
    items: ["Fine-tuning", "Model soups", "Eval sets & benchmarks", "LLM-graded QA (Gemini + n8n)", "Load testing", "pytest"],
  },
  {
    group: "Backend & Deployment",
    items: ["Python", "FastAPI", "MongoDB", "Docker", "NVIDIA DGX Spark / GPU", "n8n & Make"],
  },
  { group: "Frontend", items: ["React.js", "Next.js", "React Native", "TypeScript", "Tailwind CSS"] },
];

/** A demo video in /public: mp4 (H.264, short keyframe interval for scrubbing) + optional webm. */
export type ProjectVideo = {
  mp4: string;
  webm?: string;
  poster: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  /** CSS object-position for cropped previews (grid cards). Default: "center top". */
  cardPosition?: string;
};

export type Project = {
  slug: string;
  number: string;
  title: string;
  /** Optional gradient on the end of the title, e.g. the "AI" in VaultAI. */
  titleAccent?: { text: string; from: string; to: string };
  subtitle: string;
  year?: string;
  accent: string;
  /** Optional second stop: the accent becomes a gradient from `accent` to this. */
  accentTo?: string;
  /** Domain tag on the card, e.g. "Web app". */
  domain: string;
  /** One-line result, shown after an arrow. */
  outcome: string;
  /** Was → Became: the problem in one line, then what the build turned it into. */
  was: string;
  became: string;
  summary: string;
  challenge: string;
  build: string[];
  features: string[];
  tech: string[];
  /** Public source. Omitted for internal/company work (see `sourceNote`). */
  github?: string;
  sourceNote?: string;
  live?: string;
  /** Flagship project: shown as a wide card first in the grid. */
  featured?: boolean;
  /** Where/when it was built, e.g. an internship. */
  context?: string;
  /** Headline numbers for the case study. */
  metrics?: { value: string; label: string }[];
  /** Demo video: plays in view on the card, scroll-scrubbed on the case study. Takes priority over `image`. */
  video?: ProjectVideo;
  /** Real screenshot (in /public). Used as the card cover and shown in full on the case study. */
  image?: { src: string; alt: string; width: number; height: number; caption?: string };
};

export const projects: Project[] = [
  {
    slug: "leftover-logic",
    featured: true,
    number: "01",
    title: "Leftover Logic",
    subtitle: "AI smart pantry",
    accent: "#FFD21F",
    domain: "AI · Web",
    outcome: "from leftovers to a recipe in a couple of taps",
    was: "Leftovers go to waste because deciding what to cook takes effort.",
    became: "List what's in the fridge, get an AI-generated recipe back.",
    summary:
      "Tell it what's left in the fridge; it uses an AI API to generate recipes around those ingredients.",
    challenge:
      "Leftovers become waste because figuring out what to cook takes effort. The goal: go from a list of ingredients to a usable recipe in a couple of taps.",
    build: [
      "React and Vite front end with a modular architecture built for complex UI states.",
      "AI API integration that generates recipes from the user's available ingredients.",
      "Context API for state management, with performance and accessibility treated as requirements rather than polish.",
    ],
    features: ["Ingredient input", "AI recipe generation", "Modular UI states", "Accessible by design"],
    tech: ["React", "Vite", "Tailwind CSS", "Context API", "AI API"],
    github: "https://github.com/Dagaroth3exe/Leftover-Logic",
    video: {
      mp4: "/work/leftover-demo.mp4",
      webm: "/work/leftover-demo.webm",
      poster: "/work/leftover-demo-poster.webp",
      alt: "Screen recording of Leftover Logic: the \"What's left in your fridge?\" screen beside three animated kitchen cards for Indian, Italian and Chinese dishes.",
      width: 1600,
      height: 774,
      caption: "Pick what's in the fridge; three kitchens suggest a dish each.",
      cardPosition: "left top",
    },
  },
  {
    slug: "vaultai",
    number: "02",
    title: "VaultAI",
    // Same blue → light blue as the product's command bar
    titleAccent: { text: "AI", from: "#3D5BFF", to: "#5EC8FF" },
    subtitle: "Voice & text assistant for a secure document vault",
    // Blue → light blue, matching the product's command bar
    accent: "#3D5BFF",
    accentTo: "#5EC8FF",
    featured: true,
    context: "Internship project · DJT Corporations & Investments · Oct 2026",
    domain: "AI · Voice · On-premise",
    outcome: "say it in English, Hindi or Hinglish, and the vault does it",
    was: "A secure document vault you could only operate screen by screen.",
    became: "Typed or spoken commands that find, move, share and delete files under your own permissions.",
    summary:
      "An assistant inside the company's OTP-protected document vault. Employees type or speak a command in English, Hindi or Hinglish, and it finds, moves, renames, shares or deletes files, all under their own permissions and running fully on company hardware.",
    challenge:
      "The vault holds sensitive company documents. The assistant couldn't send anything to cloud AI, couldn't step around anyone's permissions, and couldn't change a file without the user seeing exactly what would happen first. It also had to understand Hindi and Hinglish, by voice, on a small on-premise model.",
    build: [
      "An agent on a local LLM (Qwen3-4B via Ollama) with tool calling turns everyday language into vault actions. Every action goes through the vault's own API as the logged-in user, so existing permissions and the audit trail apply unchanged.",
      "Confirmation cards show exactly what will change before anything does. It handles multi-step commands, bulk moves, follow-ups (\"share it with Priya\") and the page you're on (\"move all the files here\"), with fuzzy matching so typos still work.",
      "Voice: faster-whisper speech-to-text tuned against a benchmark I wrote (name accuracy 72% → 93% at ~0.25 s), Piper and Kokoro text-to-speech, and a \"Hey Vault\" wake word processed on our own server.",
      "Each message's language is detected and the reply matches it. Hindi replies come from a hand-written phrase table, because the small model's own Hindi was poor.",
      "Built to fail safely: time limits, retries, circuit breakers and fallbacks (a CPU speech model, a rule-based basic mode, silent replies if voice fails), plus 574 automated tests including 33 failure drills.",
      "Deployed with Docker to QA, with the LLM on a shared NVIDIA DGX Spark. I diagnosed and fixed an out-of-memory crash caused by the model's default context size, and wrote the release guide and API contract for the frontend team.",
    ],
    features: [
      "English, Hindi & Hinglish",
      "Voice with a \"Hey Vault\" wake word",
      "Confirm before anything changes",
      "Multi-step & bulk commands",
      "30-day \"recently deleted\" restore",
      "Private activity history",
      "Watch mode: actions replayed on screen",
      "Fully on-premise, no cloud AI",
    ],
    metrics: [
      { value: "99%", label: "command accuracy on a 99-command eval set, up from 96%" },
      { value: "~1 sec", label: "from spoken command to result" },
      { value: "574", label: "automated tests, including 33 failure drills" },
      { value: "693/693", label: "requests succeeded in a 10-minute, 4-user load test" },
    ],
    tech: ["Python", "FastAPI", "Ollama (Qwen3-4B)", "faster-whisper", "Piper / Kokoro TTS", "MongoDB", "Docker", "NVIDIA DGX Spark", "pytest"],
    sourceNote: "Internal company project, so the source isn't public.",
    video: {
      mp4: "/work/vaultai-demo.mp4",
      webm: "/work/vaultai-demo.webm",
      poster: "/work/vaultai-demo-poster.webp",
      alt: "Screen recording of the Vault home screen: the VaultAI command bar switches to listening, animates while it hears a command, then returns to its suggestions.",
      width: 1264,
      height: 822,
      caption: "The command bar wakes, listens, and settles back with suggested commands.",
    },
    image: {
      src: "/work/vaultai-home.webp",
      alt: "The DJT Vault home screen with the VaultAI command bar open and listening, above document and sharing summaries.",
      width: 1263,
      height: 928,
      caption: "Vault home with the assistant listening. Speak or type a command into the bar.",
    },
  },
  {
    slug: "microfinance-assistant",
    number: "03",
    title: "MFI Assistant",
    subtitle: "Bilingual AI help for a microfinance lending app",
    accent: "#22C3B5",
    context: "Internship project · DJT Corporations & Investments · Sep–Oct 2026",
    domain: "AI · FinTech · Hindi/English",
    outcome: "loan and EMI answers in everyday Hindi, from live records",
    was: "A microfinance lending app with no self-service help for its borrowers.",
    became: "A Hindi/English help section that answers general and personal loan questions from real records.",
    summary:
      "A self-service help backend for the company's Android microfinance app. Rural, mostly less-literate borrowers ask in Hindi or English about applying, paying EMIs, or their own loan, and get answers from real records through read-only, session-checked access.",
    challenge:
      "The users are rural borrowers in joint-liability lending groups, many less literate, so answers had to be in everyday spoken Hindi rather than formal Hindi. Personal answers touch live loan data, so the service could never trust a request to say who the customer is, and could never write to the production database.",
    build: [
      "General questions (how to apply, who your field officer is, how to pay an EMI) live in MongoDB, written in everyday spoken Hindi (लोन, EMI, ब्रांच) as well as English.",
      "Personal answers (loan status, next EMI, recent payments) come from the real loan and collection records. The customer is identified only through the finance app's login session, checked read-only for being live, customer-type and unexpired.",
      "QuerySense (beta): borrowers record a voice question, AI4Bharat IndicConformer transcribes it, the transcript can be edited with an English translation shown, and questions are stored for developers to answer. It sits behind a switch in a Labs section.",
      "An earlier \"Ask AI\" prototype ran a local Qwen 2.5 model through Ollama before the product moved to curated answers.",
      "Built into the company's FastAPI service layout with Docker, a health check, security headers, a request-size limit, a non-root container user and an audit log of every account lookup.",
      "Deployed to QA and production with the Android, backend and server teams, with tests for session handling and customer data isolation.",
    ],
    features: [
      "Hindi & English",
      "Everyday spoken Hindi",
      "Live loan & EMI answers",
      "Session-checked, read-only data",
      "Audit log of every lookup",
      "Voice questions (IndicConformer, beta)",
      "Dockerised FastAPI service",
      "QA + production deployment",
    ],
    tech: ["Python", "FastAPI", "MongoDB", "AI4Bharat IndicConformer", "Ollama (Qwen 2.5)", "Docker"],
    sourceNote: "Internal company project, so the source isn't public.",
  },
  {
    slug: "face-attendance",
    number: "04",
    title: "Face Attendance",
    subtitle: "Computer vision attendance for a microfinance app",
    accent: "#B57BFF",
    context: "Internship project · DJT Corporations & Investments · 2026",
    domain: "AI · Computer vision",
    outcome: "better face checks before anyone is marked present",
    was: "A face-attendance system that needed fixing before it could ship in the microfinance app.",
    became: "Lighting, blur and multi-face checks, a primary-face tracker and a more accurate recognition model.",
    summary:
      "A face-recognition attendance system planned for the company's microfinance app. I analysed, fixed and maintained it, added image-quality checks and a primary-face tracker, and moved it to a more accurate recognition model.",
    challenge:
      "Attendance photos are taken on phones, often in poor light, with motion blur or other people in frame. The system had to reject bad captures and pick the right face before attempting recognition.",
    build: [
      "Lighting validation and blur detection reject captures that are too poorly lit or too blurry before recognition runs.",
      "Multiple-face detection, plus a primary-face tracker that reliably selects the right face when more than one person is in frame.",
      "Replaced the default Buffalo v1 recognition model with Antelope v2 for better recognition accuracy.",
      "Tested and maintained locally with GPU acceleration in the QA environment.",
    ],
    features: [
      "Lighting validation",
      "Blur detection",
      "Multiple-face detection",
      "Primary-face tracker",
      "Antelope v2 recognition",
      "GPU-accelerated testing",
    ],
    tech: ["Python", "Computer vision", "Face recognition (Antelope v2)", "GPU"],
    sourceNote: "Internal company project, so the source isn't public.",
  },
  {
    slug: "orchestrix",
    number: "05",
    title: "Orchestrix",
    subtitle: "Productivity hub",
    accent: "#176BFF",
    domain: "Web app",
    outcome: "one workspace instead of six tabs",
    was: "Notes, tasks and a timer spread across separate apps.",
    became: "One real-time, split-pane dashboard with auth and alerts.",
    summary:
      "Notes, tasks, a Pomodoro timer and alerts in a single real-time, split-pane dashboard — so focus doesn't depend on six browser tabs.",
    challenge:
      "Productivity tools fragment attention: notes in one app, tasks in another, a timer somewhere else. Orchestrix pulls them into one workspace where every panel stays in sync.",
    build: [
      "Next.js and TypeScript app shell with a split-pane dashboard that keeps notes, tasks and timer visible together.",
      "Supabase authentication with email/password and OAuth, and real-time data so changes land instantly.",
      "Interface built on Tailwind CSS and shadcn/ui, with Framer Motion transitions that clarify state changes rather than decorate them.",
    ],
    features: ["Integrated notes", "Task management", "Pomodoro timer", "Alerts", "Email + OAuth auth", "Real-time dashboard"],
    tech: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS", "shadcn/ui", "Framer Motion"],
    github: "https://github.com/Dagaroth3exe/Orchestrix",
  },
  {
    slug: "earthfirst",
    number: "06",
    title: "EarthFirst",
    subtitle: "Tree-planting mobile app",
    accent: "#2BD47D",
    domain: "Mobile · Android + iOS",
    outcome: "planting as a habit, not a one-off event",
    was: "Planting drives that spike with sign-ups, then go quiet.",
    became: "Buddies, a sapling journal and leaderboards that bring people back.",
    summary:
      "A cross-platform app that turns tree-planting from a one-off event into a habit — with buddies, a sapling journal and leaderboards.",
    challenge:
      "Environmental drives get a burst of sign-ups and then go quiet. The app needed to make planting social and trackable, so people come back after the first sapling.",
    build: [
      "React Native and TypeScript codebase shipping to Android and iOS, with React Navigation for the app structure.",
      "Firebase Auth and real-time synchronisation for live event discovery.",
      "Tree Buddy matching, a sapling-tracking journal and gamified leaderboards to drive repeat engagement.",
    ],
    features: ["Firebase Auth", "Live event discovery", "Tree Buddy matching", "Sapling journal", "Leaderboards"],
    tech: ["React Native", "Firebase", "TypeScript", "React Navigation"],
    github: "https://github.com/Dagaroth3exe/earth-first-1",
  },
];

export type Stint = {
  company: string;
  role: string;
  type: string;
  period: string;
  start: string;
  summary: string;
  highlights: string[];
  stack: string[];
  /** Technologies explored / researched (shown separately from the main stack). */
  explored?: string[];
  /** Slug of a related case study to link to. */
  caseStudy?: string;
};

export const experience: Stint[] = [
  {
    company: "DJT Corporations & Investments",
    role: "AI Intern",
    type: "Internship",
    period: "Sep 2026 — Oct 2026",
    start: "2026",
    summary:
      "Built on-premise AI across language, voice and vision, from research prototypes to QA and production deployments on company hardware.",
    highlights: [
      "VaultAI: a voice and text agent for a secure document vault, on a local Qwen3-4B with tool calling. 99% command accuracy on a 99-command eval set; deployed to QA",
      "Microfinance assistant: Hindi/English self-service for rural borrowers, answering loan and EMI questions from live records through read-only, session-checked access; deployed to QA and production",
      "QuerySense (beta): spoken questions in Hindi, transcribed with AI4Bharat IndicConformer",
      "Computer vision: improved a face-attendance system for the microfinance app with lighting, blur and multi-face checks, a primary-face tracker, and a move from Buffalo v1 to Antelope v2 for better recognition",
      "Model soups R&D: fine-tuned an open-source model under several configurations to build souped variants for local use cases",
      "Support chatbot: moved an e-commerce bot from intent/regex to a hybrid intent + LLM model, with an n8n QA loop where Gemini grades responses",
    ],
    stack: ["Python", "FastAPI", "MongoDB", "Docker", "Ollama (Qwen3-4B, Qwen 2.5)", "Gemini", "faster-whisper", "IndicConformer", "Piper / Kokoro TTS", "Antelope v2", "n8n", "NVIDIA DGX Spark"],
    explored: ["LLM fine-tuning", "Model soups", "Indic speech models", "Face recognition models"],
    caseStudy: "vaultai",
  },
  {
    company: "First Feather",
    role: "Full Stack App Developer",
    type: "Freelance",
    period: "Jun 2025 — Aug 2025",
    start: "2025",
    summary:
      "Built a cross-platform React Native application for tree-planting initiatives, with real-time sync on Firebase and a reusable component library for consistent behaviour on Android and iOS.",
    highlights: [
      "Implemented user auth, live event discovery and Tree Buddy matching",
      "Engineered gamified leaderboards, a reward system and NGO dashboards",
      "Kept performance consistent across Android and iOS",
    ],
    stack: ["React Native", "Firebase", "TypeScript"],
  },
  {
    company: "Blurock Ionic",
    role: "GenAI Research & Web Developer",
    type: "Internship",
    period: "May 2024 — Jan 2025",
    start: "2024",
    summary:
      "Designed and built a responsive Order Management System UI from Figma wireframes, and used generative AI tools to accelerate UX research and validate design decisions.",
    highlights: [
      "Built the OMS interface in React, Tailwind CSS and TypeScript",
      "Integrated REST APIs and managed complex application state",
      "Used GenAI tools to surface usability issues early in the process",
    ],
    stack: ["React", "TypeScript", "Tailwind CSS", "REST APIs", "GenAI"],
  },
];

export const education = {
  degree: "Bachelor of Computer Applications",
  school: "BIT Mesra, Noida Campus",
  period: "Aug 2023 — May 2026",
};

/** Plain-language answers — the details a recruiter or client usually asks first. */
export const faq: { q: string; a: string }[] = [
  {
    q: "What do you actually do?",
    a: "I'm an AI engineer. I build LLM agents that call tools, voice assistants that work in Hindi, Hinglish and English, and computer vision for face recognition, and I run them on-premise with evals and fallbacks so they hold up in production. I can build the interface too when a project needs it.",
  },
  {
    q: "What have you been working on most recently?",
    a: "An AI internship at DJT Corporations & Investments. The biggest piece was VaultAI, a voice and text agent for the company's secure document vault. I also built a Hindi/English assistant for a microfinance app that answers borrowers' loan and EMI questions from live records, improved a face-attendance system, ran fine-tuning experiments with model soups, and moved a support chatbot to a hybrid intent + LLM model.",
  },
  {
    q: "Which models have you worked with?",
    a: "Qwen3-4B and Qwen 2.5 through Ollama for local LLMs, and Gemini for grading chatbot responses. For speech: faster-whisper and AI4Bharat IndicConformer for speech-to-text, and Piper and Kokoro for text-to-speech. For vision: the Antelope v2 face-recognition model, which replaced Buffalo v1. I also fine-tuned an open-source model to build souped variants.",
  },
  {
    q: "Have you worked with computer vision?",
    a: "Yes. I maintained and improved a face-attendance system for a microfinance app: lighting validation, blur detection, multiple-face detection, a primary-face tracker to pick the right person, and a model switch to Antelope v2 for better recognition accuracy, tested on GPU in QA.",
  },
  {
    q: "What's a model soup?",
    a: "A way to combine several fine-tuned versions of the same model by averaging their weights, instead of picking just one. I fine-tuned an open-source model under different settings, built souped variants, and analysed how they behaved on specific local use cases.",
  },
  {
    q: "How do you know your AI actually works?",
    a: "I measure it. VaultAI has a 99-command eval set (96% → 99%) and a speech benchmark (name accuracy 72% → 93%), plus 574 automated tests and a load test. For a support chatbot, I built an n8n workflow that sends it common and unusual queries and has Gemini grade every answer.",
  },
  {
    q: "Where have you worked before?",
    a: "As a freelance full-stack app developer for First Feather, building a React Native app on Firebase. Before that, a GenAI research and web developer internship at Blurock Ionic, building an order-management UI and using generative AI to test UX decisions early.",
  },
  {
    q: "Where are you based, and what did you study?",
    a: "Noida, Uttar Pradesh, India. I completed a Bachelor of Computer Applications at BIT Mesra's Noida campus in May 2026.",
  },
  {
    q: "What kind of work are you looking for?",
    a: "AI engineering roles, full-time or freelance: LLM agents, voice and speech, computer vision, or bringing AI into an existing product, especially on-premise or in Indian languages.",
  },
];

export const contact = {
  headline: ["Got work", "AI should", "be doing?"],
  text: "Teams with documents, customers or workflows that AI could handle, especially on-premise or in Indian languages: I'm open to AI engineering roles, freelance builds and collaborations.",
  takeOn: [
    "LLM agents & assistants with tool calling",
    "Voice AI in English, Hindi & Hinglish",
    "Computer vision & on-premise model deployment",
  ],
  howItStarts:
    "An email with what you're building and what's slowing it down. No forms, no rate card. I'll reply with questions, then a plan.",
};
