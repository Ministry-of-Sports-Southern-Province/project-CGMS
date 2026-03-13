export function calculateGrade(score) {
  const s = Number(score);
  if (s > 75) return { grade: "A", label: "Excellent", color: "green" };
  if (s > 55 && s <= 75) return { grade: "B", label: "Very Good", color: "blue" };
  if (s >= 40 && s <= 55) return { grade: "C", label: "Good", color: "yellow" };
  if (s > 19 && s <= 40) return { grade: "D", label: "Normal", color: "orange" };
  return { grade: "E", label: "Weak", color: "red" };
}
