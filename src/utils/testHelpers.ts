import { Test } from '../types';

export type TestStatus = 'live' | 'upcoming' | 'expired';

/**
 * Computes the real-time status of a test paper based on current time
 * vs. admin configured startTime and endTime.
 */
export function computeTestStatus(test: Test): TestStatus {
  if (!test) return 'live';

  const now = Date.now();

  // 1. Check if start time is set and in the future
  if (test.startTime) {
    const startMs = new Date(test.startTime).getTime();
    if (!isNaN(startMs) && now < startMs) {
      return 'upcoming';
    }
  }

  // 2. Check if end time is set and in the past
  if (test.endTime) {
    const endMs = new Date(test.endTime).getTime();
    if (!isNaN(endMs) && now > endMs) {
      return 'expired';
    }
  }

  // 3. Otherwise, if published, it is live
  return 'live';
}

/**
 * Formats ISO or datetime-local string to human readable format
 */
export function formatDateTime(dateStr?: string): string {
  if (!dateStr) return 'Not set';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Returns human readable countdown/time difference string
 */
export function getTimeDifferenceText(targetDateStr?: string): string {
  if (!targetDateStr) return '';
  const targetMs = new Date(targetDateStr).getTime();
  if (isNaN(targetMs)) return '';

  const diffMs = targetMs - Date.now();
  if (diffMs <= 0) return 'Passed';

  const minsTotal = Math.floor(diffMs / (1000 * 60));
  const hoursTotal = Math.floor(minsTotal / 60);
  const daysTotal = Math.floor(hoursTotal / 24);

  if (daysTotal > 0) {
    const remHours = hoursTotal % 24;
    return `${daysTotal}d ${remHours}h`;
  }

  if (hoursTotal > 0) {
    const remMins = minsTotal % 60;
    return `${hoursTotal}h ${remMins}m`;
  }

  return `${minsTotal} mins`;
}
