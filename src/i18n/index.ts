// Importación de los archivos de idiomas
import en from "@/i18n/locales/en.json";
import es from "@/i18n/locales/es.json";
import fr from "@/i18n/locales/fr.json";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/locales";

// Objeto con los locales cargados
const locales: Record<Locale, typeof es> = { es, en, fr };

// Función para obtener las traducciones
export const getI18N = ({
	currentLocale = DEFAULT_LOCALE,
}: {
	currentLocale?: string;
}) => {
	return locales[currentLocale as Locale] || locales[DEFAULT_LOCALE];
};
