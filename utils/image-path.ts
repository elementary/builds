export const CHANNELS = ['daily', 'stable'] as const;
export type Channel = (typeof CHANNELS)[number];

export type Architecture = 'x86-64' | 'arm64';

const ARCHITECTURES: Record<string, Architecture> = {
  'x86-64': 'x86-64',
  amd64: 'x86-64',
  arm64: 'arm64',
};

const ARCH_PATTERN = Object.keys(ARCHITECTURES)
  .sort((a, b) => b.length - a.length)
  .join('|');

const FILENAME = new RegExp(
  `^elementaryos-(\\d+\\.\\d+)-(${CHANNELS.join('|')})-(${ARCH_PATTERN})\\.(\\d{8}|\\d{14})\\.(?:iso|img\\.xz)$`
);

export interface ParsedImagePath {
  key: string;
  filename: string;
  channel: Channel;
  version: string;
  arch: Architecture;
  built: Date;
}

export function channelForKey(key: string): Channel | null {
  const filename = key.split('/').pop() ?? '';
  return CHANNELS.find(channel => filename.includes(`-${channel}-`)) ?? null;
}

function buildDate(stamp: string): Date | null {
  // 8 digits is a date-only stamp; 14 adds the time.
  const date = new Date(Date.UTC(
    Number(stamp.slice(0, 4)),
    Number(stamp.slice(4, 6)) - 1,
    Number(stamp.slice(6, 8)),
    Number(stamp.slice(8, 10) || 0),
    Number(stamp.slice(10, 12) || 0),
    Number(stamp.slice(12, 14) || 0)
  ));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function parseImagePath(key: string): ParsedImagePath | null {
  const segments = key.split('/');
  if (segments.length > 2) return null;

  const filename = segments[segments.length - 1] ?? '';
  const match = FILENAME.exec(filename);
  if (!match) return null;

  const [, version, channel, arch, stamp] = match as unknown as [string, string, Channel, string, string];
  const architecture = ARCHITECTURES[arch];
  if (!architecture) return null;

  if (segments.length === 2) {
    const directory = ARCHITECTURES[segments[0] ?? ''];
    if (!directory || directory !== architecture) return null;
  }

  const built = buildDate(stamp);
  if (!built) return null;

  return { key, filename, channel, version, arch: architecture, built };
}
