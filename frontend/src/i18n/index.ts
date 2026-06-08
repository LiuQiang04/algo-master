import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import zhCN from './locales/zh-CN.json';
import enUS from './locales/en-US.json';

export type Locale = 'zh-CN' | 'en-US';

const resources: Record<Locale, Record<string, Record<string, string>>> = {
  'zh-CN': zhCN as Record<string, Record<string, string>>,
  'en-US': enUS as Record<string, Record<string, string>>,
};

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      locale: 'zh-CN',
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'algoarena-locale' },
  ),
);

/**
 * Resolve a dotted key like "common.loading" against the current locale.
 * Supports interpolation: replace {name} tokens with values from `params`.
 */
export function t(
  key: string,
  params?: Record<string, string | number>,
  locale?: Locale,
): string {
  const currentLocale = locale ?? useI18nStore.getState().locale;
  const dict = resources[currentLocale];

  // Walk the dotted path: "learningPaths.title" -> dict["learningPaths"]["title"]
  const parts = key.split('.');
  let value: string | undefined;
  let current: Record<string, unknown> = dict as Record<string, unknown>;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      const next = current[part];
      if (typeof next === 'string') {
        value = next;
        break;
      }
      current = next as Record<string, unknown>;
    } else {
      break;
    }
  }

  // Fallback: return the key itself if not found
  if (value === undefined) return key;

  // Interpolate {name} tokens
  if (params) {
    return value.replace(/\{(\w+)\}/g, (_, name: string) =>
      params[name] !== undefined ? String(params[name]) : `{${name}}`,
    );
  }

  return value;
}
