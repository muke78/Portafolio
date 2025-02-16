// Definición de idiomas soportados
const LANG = {
  ENGLISH: "en",
  SPANISH: "es",
  FRANCE: "fr",
} as const;

// Tipo para los idiomas soportados
type Language = keyof typeof LANG;

// Importación dinámica de los archivos de idiomas
const locales = {
  [LANG.ENGLISH]: await import("@/i18n/locales/en.json").then((m) => m.default),
  [LANG.SPANISH]: await import("@/i18n/locales/es.json").then((m) => m.default),
  [LANG.FRANCE]: await import("@/i18n/locales/fr.json").then((m) => m.default),
};

// Función para obtener las traducciones
export const getI18N = ({
  currentLocale = LANG.SPANISH,
}: {
  currentLocale?: string;
}) => {
  // Validar que el idioma solicitado esté en los locales
  if (currentLocale in locales) {
    return locales[currentLocale as keyof typeof locales];
  }
  // Devolver el idioma por defecto (español) si no se encuentra
  return locales[LANG.SPANISH];
};
