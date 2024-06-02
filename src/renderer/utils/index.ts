export function filterNonNull<T>(arr: (T | null)[]): T[] {
  return arr.filter((item): item is T => item !== null);
}

export function timeSpent(start: string, end: string): string {
  const startTime = new Date(start);
  const endTime = new Date(end);
  const diff = endTime.getTime() - startTime.getTime();
  return diff.toString();
}