// Slots are in the platform's time zone, whatever the browser's is.
const TIME_ZONE = 'America/Argentina/Buenos_Aires';

const dateTime = new Intl.DateTimeFormat('es-AR', {
  timeZone: TIME_ZONE,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const time = new Intl.DateTimeFormat('es-AR', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const day = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE });

export const formatDateTime = (iso: string): string => dateTime.format(new Date(iso));

export const formatTime = (iso: string): string => time.format(new Date(iso));

// en-CA formats dates as YYYY-MM-DD, the format the API's availability expects.
export const todayInPlatform = (now: Date = new Date()): string => day.format(now);

const longDay = new Intl.DateTimeFormat('es-AR', {
  timeZone: TIME_ZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

export const formatLongDay = (date: Date | string): string => longDay.format(new Date(date));

// Same day in the platform time zone.
export const sameDay = (a: Date | string, b: Date | string): boolean =>
  day.format(new Date(a)) === day.format(new Date(b));

// Start of the day's last slot (18:30), in minutes since midnight in the platform time zone.
const LAST_SLOT_START = 18 * 60 + 30;

const clock = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

// `day` is a YYYY-MM-DD platform day; noon UTC keeps the arithmetic clear of time zones.
export const addDays = (day: string, days: number): string => {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

// Today while a slot can still start, otherwise tomorrow.
export const firstBookableDay = (now: Date = new Date()): string => {
  const [hours, minutes] = clock.format(now).split(':').map(Number);
  const today = todayInPlatform(now);
  return hours * 60 + minutes < LAST_SLOT_START ? today : addDays(today, 1);
};

const dayChip = new Intl.DateTimeFormat('es-AR', { timeZone: 'UTC', weekday: 'short', day: 'numeric' });

export const formatDayChip = (day: string): string => dayChip.format(new Date(`${day}T12:00:00Z`));
