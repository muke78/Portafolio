import english from "@/i18n/locales/en.json";
import spanish from "@/i18n/locales/es.json";
import france from "@/i18n/locales/fr.json";

const LANG = {
  ENGLISH: "en",
  SPANISH: "es",
  FRANCE: "fr",
};

export const getI18N = ({
  currentLocale = "es",
}: {
  currentLocale: string | undefined;
}) => {
  // if (currentLocale === LANG.ENGLISH) return { ...spanish, ...english, ...france };
  // return spanish;
  if (currentLocale === LANG.ENGLISH) {
    return { ...english };
  }

  if (currentLocale === LANG.SPANISH) {
    return { ...spanish };
  }

  if (currentLocale === LANG.FRANCE) {
    return { ...france };
  }
};
