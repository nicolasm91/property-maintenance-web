import { addDays, firstBookableDay, formatTime, todayInPlatform } from './dates.ts';

describe('dates', () => {
  it('shows times in the platform time zone', () => {
    expect(formatTime('2026-11-02T13:00:00.000Z')).toBe('10:00');
  });

  it("uses the platform's day, not UTC's", () => {
    expect(todayInPlatform(new Date('2026-11-02T02:00:00Z'))).toBe('2026-11-01');
  });

  it.each([
    ['in the morning', '2026-11-02T09:00:00-03:00', '2026-11-02'],
    ['right before the last slot starts', '2026-11-02T18:29:00-03:00', '2026-11-02'],
    ['once the last slot started', '2026-11-02T18:30:00-03:00', '2026-11-03'],
    ['late at night', '2026-11-02T23:55:00-03:00', '2026-11-03'],
  ])('opens bookings on the right day %s', (_, now, expected) => {
    expect(firstBookableDay(new Date(now))).toBe(expected);
  });

  it('adds days across months', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
  });
});
