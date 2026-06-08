import { useCallback } from 'react';
import { useI18nStore, t } from './index';
import type { Locale } from './index';

/**
 * Hook for translations in React components.
 *
 * Usage:
 *   const { t, locale, setLocale } = useTranslation();
 *   <h1>{t('problems.title')}</h1>
 *   <p>{t('learningPaths.estimatedTime', { hours: 40 })}</p>
 */
export function useTranslation() {
  const locale = useI18nStore((s) => s.locale);
  const setLocale = useI18nStore((s) => s.setLocale);

  const translate = useCallback(
    (key: string, params?: Record<string, string | number>) => t(key, params, locale),
    [locale],
  );

  return { t: translate, locale, setLocale } as const;
}

export type { Locale };
