import type { Dictionary } from "./fr";

export const en: Dictionary = {
  nav: { about: "About me", projects: "Projects", contact: "Contact" },
  home: {
    title: "Welcome to my portfolio!",
    intro: "Got a bold idea you want to bring to life? I put my development expertise to work on the most innovative projects to make them real. Discover my full profile with the button just below.",
    cta: "About me",
  },
    about: {
    title: "Hi, I'm Asiya!",
    skillGroups: [
      {
        title: "Technical skills",
        items: ["C/C++", "Typescript/Javascript", "NodeJs", "Python", "SQL, Database management"],
      },
      {
        title: "Soft skills",
        items: ["Autonomy", "Organization", "Initiative", "Adaptability"],
      },
      {
        title: "Interests",
        items: ["Wide-ranging reading", "Tech", "Motorsport"],
      },
    ],
    paragraphs: [
      "My name is Asiya Ajili Diallo. I am a developer and currently a student at École 42 Mulhouse. My path, built on autonomy and pushing my own limits, has given me an unusual profile: I was homeschooled throughout my education and earned my French general baccalauréat as an independent candidate. This tailor-made setup allowed me to pursue my studies and my first programming projects side by side. Thanks to this rigorous and intensive way of working, I have become highly adaptable: I learn fast, organize myself efficiently and strictly meet deadlines. At École 42, I found the same dynamic, based on peer learning and managing projects under time constraints. Beyond the technical side, the human and collective aspect motivated me right away: deeply involved in campus life, I joined the student union (BDE) and founded my own association to help students create their clubs and to energize the school's community life. My path has therefore allowed me to develop strong autonomy while excelling at teamwork.",
      "Building on this background, I have developed solid technical knowledge and great versatility. After specializing in Mathematics and Computer Science (NSI) in high school, which grounded me in algorithmic logic and programming fundamentals, I joined École 42. There I strengthened my foundations through a demanding core curriculum focused on C and C++, before moving on to my current specialization: AI, Software Engineering and Backend. Now preparing an RNCP Level 7 diploma (equivalent to a master's degree), I design complex algorithms, build and integrate LLM models, and develop robust backend architectures. My versatility lets me work on AI problems as well as full-stack projects, building applications from A to Z (development, deployment and maintenance). Whether it is helping a startup design innovative technologies or contributing within a large team, I put my technical skills and adaptability to work on your challenges. Want to see what I can do? This portfolio is interactive! You can not only read the details of my work, but also launch some projects directly inside a container to test them in real time. Head to the Projects section to discover what I have built!",
    ],
  },
  common: { loading: "Loading…", backToProjects: "Back to projects" },
  errors: {
    loadProjects: "Unable to load projects",
    rateLimited: "Too many messages sent, try again in an hour.",
    sendFailed: "Sending failed, please try again later.",
  },
  projects: { title: "My projects" },
    projectPage: {
    visitSite: "Visit the website",
    test: "Try it",
    documents: "Resources",
    collaborators: "Collaborators",
    repository: "Project repository",
    viewOnGithub: "View the project on GitHub ↗",
  },
  sandbox: {
    rateLimited: "You have launched a lot of tests in a short time. Please try again in about ten minutes.",
    full: "All test environments are busy right now. Please try again in a few minutes.",
    close: "Close",
    retry: "Retry",
    launchFailed: "Unable to launch the sandbox",
    compiling: "Compiling and launching, this can take up to a minute…",
    startingTerminal: "Starting the terminal…",
    startingDisplay: "Starting the display…",
  },
  contact: {
    title: "Contact me",
    intro: "A question, an opportunity or just want to talk? Leave me a message and I'll get back to you quickly.",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    emailPlaceholder: "you@example.com",
    message: "Your message",
    messagePlaceholder: "Tell me about your project or ask me any questions you have.",
    sending: "Sending…",
    send: "Send message",
    sent: "Message sent, thank you! I'll get back to you very soon.",
    responseTime: "Reply within 24 to 48 hours",
    privacy: "Your message is never shared",
  },
};
