export const subjects = [
  "maths",
  "language",
  "science",
  "history",
  "coding",
  "economics",
];

export const subjectsColors: Record<string, string> = {
  science: "#14b8a6",
  maths: "#3b82f6",
  language: "#f59e0b",
  coding: "#ef4444",
  history: "#f97316",
  economics: "#22c55e",
};

export const voices = {
  male: { casual: "2BJW5coyhAzSr8STdHbE", formal: "c6SfcYrb2t09NHXiT80T" },
  female: { casual: "ZIlrSGI4jZqobxRKprJz", formal: "sarah" },
};

export const templateCompanions = [
  {
    name: "Lara",
    subject: "science",
    topic: "Introduction to Human Biology",
    voice: "female",
    style: "formal",
    duration: 30,
    author: "system",
  },
  {
    name: "Boris",
    subject: "history",
    topic: "The Rise and Fall of Ancient Rome",
    voice: "male",
    style: "casual",
    duration: 25,
    author: "system",
  },
  {
    name: "Suzan",
    subject: "maths",
    topic: "Algebra: Equations & Problem Solving",
    voice: "female",
    style: "casual",
    duration: 20,
    author: "system",
  },
];
