"use client";

import { useAppStore } from "./store";
import { getTranslations, type Translations } from "./translations";

export function useT(): Translations {
  const user = useAppStore((s) => s.user);
  const lang = user?.nativeLanguage || "es";
  return getTranslations(lang);
}
