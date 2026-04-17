import type { RawLesson } from "./types";

const MOCK_STUDENTS = [
  { name: "Student A", location: "United States" },
  { name: "Student B", location: "Germany" },
  { name: "Student C", location: "United Kingdom" },
  { name: "Student D", location: "United Arab Emirates" },
  { name: "Student E", location: "France" },
  { name: "Student F", location: "Netherlands" },
  { name: "Student G", location: "Australia" },
  { name: "Student H", location: "Spain" },
  { name: "Student I", location: "Brazil" },
  { name: "Student J", location: "Saudi Arabia" },
  { name: "Student K", location: "Italy" },
  { name: "Student L", location: "Ukraine" },
  { name: "Student M", location: "Switzerland" },
  { name: "Student N", location: "Poland" },
  { name: "Student O", location: "India" },
  { name: "Student P", location: "Nigeria" },
  { name: "Student Q", location: "Israel" },
  { name: "Student R", location: "Singapore" },
  { name: "Student S", location: "Qatar" },
  { name: "Student T", location: "Belgium" },
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateMockLessons(): RawLesson[] {
  const rand = seededRandom(42);
  const lessons: RawLesson[] = [];
  const startDate = new Date(2024, 8, 15);

  for (const student of MOCK_STUDENTS) {
    const trialDate = new Date(
      startDate.getTime() + Math.floor(rand() * 180) * 24 * 60 * 60 * 1000
    );
    const hour = 8 + Math.floor(rand() * 13);

    lessons.push({
      serviceType: "Preply Marketplace",
      student: student.name,
      studentLocation: student.location,
      lessonDate: new Date(trialDate.getFullYear(), trialDate.getMonth(), trialDate.getDate(), hour, 0),
      dateConfirmed: new Date(trialDate.getFullYear(), trialDate.getMonth(), trialDate.getDate(), hour + 1, 0),
      type: "Trial",
      lessonPriceUSD: 15 + Math.floor(rand() * 4) * 5,
      tutorPayoutPercent: null,
      earningUSD: null,
    });

    const converts = rand() > 0.3;
    if (!converts) continue;

    const delayDays = Math.floor(rand() * rand() * 14) + 1;
    const basePrice = 20 + Math.floor(rand() * 10) * 5;
    const payoutPct = 67 + Math.floor(rand() * 3) * 5;
    const totalPaidLessons = Math.floor(rand() * rand() * 80) + 1;

    for (let i = 0; i < totalPaidLessons; i++) {
      const dayOffset = delayDays + Math.floor(i * (3 + rand() * 7));
      const lessonDate = new Date(
        trialDate.getTime() + dayOffset * 24 * 60 * 60 * 1000
      );
      const lessonHour = 8 + Math.floor(rand() * 13);
      const price = basePrice + Math.floor(i / 20) * 5;
      const earning = parseFloat(((price * payoutPct) / 100).toFixed(2));

      lessons.push({
        serviceType: "Preply Marketplace",
        student: student.name,
        studentLocation: student.location,
        lessonDate: new Date(lessonDate.getFullYear(), lessonDate.getMonth(), lessonDate.getDate(), lessonHour, 0),
        dateConfirmed: new Date(lessonDate.getFullYear(), lessonDate.getMonth(), lessonDate.getDate(), lessonHour + 1, 0),
        type: "Non-trial lesson",
        lessonPriceUSD: price,
        tutorPayoutPercent: payoutPct,
        earningUSD: earning,
      });
    }
  }

  return lessons.sort((a, b) => a.lessonDate.getTime() - b.lessonDate.getTime());
}

export const MOCK_DATA: RawLesson[] = generateMockLessons();
