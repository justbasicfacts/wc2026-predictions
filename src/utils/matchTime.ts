const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Parse a gameData date+time (both UTC) into a JS Date */
export function parseMatchUTC(dateStr: string, timeStr: string): Date {
  const [dayStr, mon] = dateStr.split(' ');
  const monthIdx = MONTHS.indexOf(mon);
  const [hh, mm] = (timeStr || '12:00').split(':');
  return new Date(Date.UTC(2026, monthIdx, parseInt(dayStr), parseInt(hh), parseInt(mm)));
}

/** Kickoff time formatted in the user's local timezone */
export function formatLocalTime(dateStr: string, timeStr: string): string {
  if (!timeStr) return '';
  return parseMatchUTC(dateStr, timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Kickoff date formatted in the user's local timezone */
export function formatLocalDate(dateStr: string, timeStr: string): string {
  return parseMatchUTC(dateStr, timeStr || '12:00').toLocaleDateString([], { day: 'numeric', month: 'short' });
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Is the match kicking off on today's local calendar date? */
export function isMatchToday(dateStr: string, timeStr: string): boolean {
  const kickoff = parseMatchUTC(dateStr, timeStr || '12:00');
  const now = new Date();
  return kickoff.getFullYear() === now.getFullYear() &&
         kickoff.getMonth() === now.getMonth() &&
         kickoff.getDate() === now.getDate();
}

/** Did the match kick off in the last 1–3 local days? */
export function isMatchRecent(dateStr: string, timeStr: string): boolean {
  const kickoff = parseMatchUTC(dateStr, timeStr || '12:00');
  const kickoffDay = startOfLocalDay(kickoff);
  const today = startOfLocalDay(new Date());
  const diff = (today.getTime() - kickoffDay.getTime()) / 86400000;
  return diff > 0 && diff <= 3;
}

/** Does the match kick off in the next 1–3 local days? */
export function isMatchUpcoming(dateStr: string, timeStr: string): boolean {
  const kickoff = parseMatchUTC(dateStr, timeStr || '12:00');
  const kickoffDay = startOfLocalDay(kickoff);
  const today = startOfLocalDay(new Date());
  const diff = (kickoffDay.getTime() - today.getTime()) / 86400000;
  return diff > 0 && diff <= 3;
}
