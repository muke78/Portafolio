import english from "@/i18n/locales/en.json";
import spanish from "@/i18n/locales/es.json";
import france from "@/i18n/locales/fr.json";

const LANG = {
  ENGLISH: "en",
  SPANISH: "es",
  FRANCE: "fr",
};

const locales = {
  [LANG.ENGLISH]: english,
  [LANG.SPANISH]: spanish,
  [LANG.FRANCE]: france,
};

export const getI18N = ({
  currentLocale = LANG.SPANISH,
}: {
  currentLocale: string | undefined;
}) => {
  return locales[currentLocale] || locales[LANG.SPANISH];
};
