
// Edit this file to swap in your own name, copy, links, and projects.
// Nothing below touches layout or styling — it's pure content.

export const profile = {
  name: "Rajkiran K R",
  role: "CSE STUDENT & DEVELOPER",
  location: "Kerala, India / Open to relocation",
  availability: "OPEN FOR OPPORTUNITIES",
  isAvailable: true,
  portraitAlt: "Portrait of Rajkiran K R",
  email: "rajkirankrajendran@gmail.com",
};

export const heroMetrics = [
  { label: "Active projects", value: "03" },
  { label: "Core languages", value: "07" },
  { label: "Current GPA", value: "9.3" },
];

export const manifesto = {
  eyebrow: "Manifesto",
  statement:
    "I turn ambitious ideas into polished products, blending engineering and design to create experiences worth remembering.",
};

export const techStack = [
  {
    tag: "DEV.01",
    name: "React",
    note: "Modern web interfaces & applications",
  },
  {
    tag: "DEV.02",
    name: "Flutter",
    note: "Cross-platform mobile development",
  },
  {
    tag: "DEV.03",
    name: "Python",
    note: "Automation, AI & scripting",
  },
  {
    tag: "DEV.04",
    name: "Java",
    note: "OOP, application development",
  },
  {
    tag: "DEV.05",
    name: "C",
    note: "DSA, memory & systems fundamentals",
  },
  {
    tag: "DEV.06",
    name: "JavaScript",
    note: "Web interactions & application logic",
  },
  {
    tag: "DEV.07",
    name: "Firebase",
    note: "Backend services & application data",
  },
];

export type Project = {
  index: string;
  title: string;
  year: string;
  description: string;
  stack: string[];
  href: string; // link to source
  size: "lg" | "md" | "sm"; // controls bento span
};

export const projects: Project[] = [
  {
    index: "01",
    title: "Gym Tracker",
    year: "2026",
    description:
      "A React-based gym tracking application for managing workouts, exercises, progress, and training data through a clean dashboard.",
    stack: ["React", "JavaScript", "CSS"],
    href: "https://github.com/",
    size: "lg",
  },
  {
    index: "02",
    title: "ClosetAI",
    year: "2026",
    description:
      "A Flutter fashion application exploring AI-assisted outfit discovery and digital wardrobe management.",
    stack: ["Flutter", "Dart", "Firebase"],
    href: "https://github.com/",
    size: "md",
  },
  {
    index: "03",
    title: "Shorts Automation",
    year: "2026",
    description:
      "An automated pipeline that generates short-form videos using AI scripts, text-to-speech, captions, stock footage, and programmatic video assembly.",
    stack: ["Python", "Gemini", "Edge-TTS", "Whisper", "MoviePy"],
    href: "https://github.com/",
    size: "lg",
  },
  {
    index: "04",
    title: "Wordle Clone",
    year: "2026",
    description:
      "A browser-based Wordle-style game built to practice JavaScript, DOM manipulation, game logic, and interactive UI development.",
    stack: ["HTML", "CSS", "JavaScript"],
    href: "https://github.com/",
    size: "md",
  },
];

export const socials = [
  { label: "GitHub", href: "https://github.com/rajkirankr-beep" },
  { label: "LinkedIn", href: "https://linkedin.com/" },
  { label: "Instagram", href:"https://www.instagram.com/ra._.kiran/"}
];
