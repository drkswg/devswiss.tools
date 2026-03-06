import type { LucideIcon } from 'lucide-react';
import { Binary, Clock3, Fingerprint, Hash, Sparkles, Wrench } from 'lucide-react';

import type { IconKey } from '@/lib/tools/contracts';

const iconMap = Object.freeze({
  binary: Binary,
  clock: Clock3,
  fingerprint: Fingerprint,
  hash: Hash,
  sparkles: Sparkles,
  wrench: Wrench
} satisfies Record<IconKey, LucideIcon>);

export function resolveToolIcon(iconKey: IconKey): LucideIcon {
  return iconMap[iconKey];
}

export const toolIconMap = iconMap;
