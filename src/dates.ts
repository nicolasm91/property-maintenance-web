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
