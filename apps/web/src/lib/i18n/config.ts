'use client';

import { create } from 'zustand';
import en from '../../messages/en.json';
import hi from '../../messages/hi.json';
import te from '../../messages/te.json';

export type SupportedLocale = 'en' | 'hi' | 'te';

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: 'English',
  hi: 'हिंदी (Hindi)',
  te: 'తెలుగు (Telugu)',
};

const dictionaries: Record<SupportedLocale, typeof en> = {
  en,
  hi: hi as typeof en,
  te: te as typeof en,
};

interface I18nStore {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (path: string, fallback?: string) => string;
}

export const useI18n = create<I18nStore>((set, get) => ({
  locale: 'en',
  setLocale: (locale) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vote_wallet_locale', locale);
    }
    set({ locale });
  },
  t: (path: string, fallback?: string) => {
    const { locale } = get();
    const dict = dictionaries[locale] || dictionaries.en;
    const parts = path.split('.');
    let current: any = dict;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        // Fallback to English if translation missing
        let enCurrent: any = dictionaries.en;
        for (const enPart of parts) {
          if (enCurrent && typeof enCurrent === 'object' && enPart in enCurrent) {
            enCurrent = enCurrent[enPart];
          } else {
            return fallback || path;
          }
        }
        return typeof enCurrent === 'string' ? enCurrent : (fallback || path);
      }
    }
    return typeof current === 'string' ? current : (fallback || path);
  },
}));
