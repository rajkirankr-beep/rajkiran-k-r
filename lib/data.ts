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
  { label: "Active projects", value: "06" },
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
    name: "Next.js",
    note: "App Router, PWAs & full-stack web apps",
  },
  {
    tag: "DEV.03",
    name: "Python",
    note: "Automation, AI & media pipelines",
  },
  {
    tag: "DEV.04",
    name: "TypeScript",
    note: "Type-safe frontend & backend systems",
  },
  {
    tag: "DEV.05",
    name: "C / C++",
    note: "DSA, memory & systems fundamentals",
  },
  {
    tag: "DEV.06",
    name: "JavaScript",
    note: "Web interactions, extensions & algorithms",
  },
  {
    tag: "DEV.07",
    name: "Supabase & Firebase",
    note: "Auth, databases & cloud deployment",
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
    title: "find my professor",
    year: "2026",
    description:
      "Mobile-first web app for IIIT Kottayam combining faculty timetables, campus network context, and crowdsourced student check-ins to track live cabin availability.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase"],
    href: "https://github.com/rajkirankr-beep/prof-tracker",
    size: "lg",
  },
  {
    index: "02",
    title: "Lyric Flow",
    year: "2026", 
    description:
      "Automated Python and Remotion pipeline that clips audio hooks, transcribes word-level timestamps with local Whisper, and renders Spotify-style kinetic lyric videos.",
    stack: ["Python", "React", "Remotion", "OpenAI Whisper"],
    href: "https://github.com/rajkirankr-beep/lyric-flow",
    size: "md",
  },
  // {
  //   index: "03",
  //   title: "Exam Study Tracker PWA",
  //   year: "2026",
  //   description:
  //     "Installable dark-mode study planner built with Next.js, TypeScript, and Supabase that calculates daily revision targets and tracks course progress.",
  //   stack: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase"],
  //   href: "https://github.com/rajkirankr-beep",
  //   size: "md",
  // },
  // {
  //   index: "04",
  //   title: "Gym Tracker",
  //   year: "2026",
  //   description:
  //     "Full-stack React workout log with Firebase authentication, progressive overload tracking, 1-Rep Max estimation, and customizable training splits.",
  //   stack: ["React", "JavaScript", "Firebase", "Firestore"],
  //   href: "https://github.com/rajkirankr-beep",
  //   size: "lg",
  // },
  {
    index: "03",
    title: "LMSprint",
    year: "2026",
    description:
      "Browser extension for bulk-downloading PDFs and lecture decks directly from the IIIT Kottayam LMS using an active authenticated session.",
    stack: ["JavaScript", "Chrome Extension", "HTML", "CSS"],
    href: "https://github.com/rajkirankr-beep/lmsprint-extension",
    size: "md",
  },
  {
    index: "04",
    title: "Wordlead",
    year: "2026",
    description:
      "Client-side HTML5/JavaScript word puzzle game powered by a 13,000-word dictionary and a wildcard-bucket BFS hint solver, deployed on Cloudflare Pages.",
    stack: ["JavaScript", "HTML5", "BFS Algorithm", "Cloudflare Pages"],
    href: "https://github.com/rajkirankr-beep",
    size: "md",
  },
];

export const socials = [
  { label: "GitHub", href: "https://github.com/rajkirankr-beep" },
  { label: "LinkedIn", href: "https://linkedin.com/" },
  { label: "Instagram", href: "https://www.instagram.com/ra._.kiran/" },
];