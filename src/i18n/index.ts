// Importación de los archivos de idiomas
import en from "@/i18n/locales/en.json";
import es from "@/i18n/locales/es.json";
import fr from "@/i18n/locales/fr.json";

// Definición de idiomas soportados
const LANG = {
  ENGLISH: "en",
  SPANISH: "es",
  FRENCH: "fr",
} as const;

// Objeto con los locales cargados
const locales = {
  [LANG.ENGLISH]: en,
  [LANG.SPANISH]: es,
  [LANG.FRENCH]: fr,
};

// Función para obtener las traducciones
export const getI18N = ({
  currentLocale = LANG.SPANISH,
}: {
  currentLocale?: string;
}) => {
  return (
    locales[currentLocale as keyof typeof locales] || locales[LANG.SPANISH]
  );
};
