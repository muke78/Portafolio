import { z } from "zod";
import { getI18N } from "@/i18n";
import type { PropsLang } from "@/types/currentLang.interface";

export const opinionsSchema = ({ currentLocale }: PropsLang) => {
	const i18n = getI18N({ currentLocale });
	const schema = z.object({
		name: z
			.string()
			.min(5, i18n.FORM.FORM_VALID_NAME)
			.max(100, i18n.FORM.FORM_VALID_NAME_MAX),
		job: z
			.string()
			.max(100, i18n.OPINIONS.OPINIONS_FORM_VALID_JOB_MAX)
			.optional(),
		description: z
			.string()
			.min(14, i18n.OPINIONS.OPINIONS_FORM_VALID_MORE_INFORMATION_MIN)
			.max(500, i18n.OPINIONS.OPINIONS_FORM_VALID_MORE_INFORMATION_MAX),
		country: z
			.string()
			.min(1, i18n.OPINIONS.OPINIONS_FORM_VALID_COUNTRY_EMPTY)
			.max(100, i18n.OPINIONS.OPINIONS_FORM_VALID_COUNTRY_MAX),
		country_flag: z
			.string()
			.length(2, i18n.OPINIONS.OPINIONS_FORM_VALID_COUNTRY_FLAG_LENGTH),
	});
	return schema;
};
