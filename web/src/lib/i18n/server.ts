import { cookies } from "next/headers";
import { cache } from "react";

import { LOCALE_COOKIE, resolveLocale } from "./config";
import { createTranslator } from "./translate";

export const getLocale = cache(async () => {
  const cookieStore = await cookies();
  return resolveLocale(cookieStore.get(LOCALE_COOKIE)?.value);
});

export async function getTranslations() {
  const locale = await getLocale();
  return { locale, t: createTranslator(locale) };
}
