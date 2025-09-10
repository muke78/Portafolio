import { z } from "zod";
import { getI18N } from "@/i18n";
import type { PropsLang } from "@/interfaces/currentLang.interface";

export const opinionsSchema = ({ currentLocale }: PropsLang) => {
	const i18n = getI18N({ currentLocale });
	const schema = z.object({
		name: z.string().min(5, i18n.FORM.FORM_VALID_NAME),
		job: z.string().optional(),
		description: z
			.string()
			.min(14, i18n.OPINIONS.OPINIONS_FORM_VALID_MORE_INFORMATION_MIN)
			.max(500, i18n.OPINIONS.OPINIONS_FORM_VALID_MORE_INFORMATION_MAX),
		country: z.string().min(1, "El pais no puede estar vacio"),
		country_flag: z.string().min(1),
	});
	return schema;
};
