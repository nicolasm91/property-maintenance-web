import { formatTime, todayInPlatform } from './dates.ts';

describe('dates', () => {
  it('shows times in the platform time zone', () => {
    expect(formatTime('2026-11-02T13:00:00.000Z')).toBe('10:00');
  });

  it("uses the platform's day, not UTC's", () => {
    expect(todayInPlatform(new Date('2026-11-02T02:00:00Z'))).toBe('2026-11-01');
  });
});
