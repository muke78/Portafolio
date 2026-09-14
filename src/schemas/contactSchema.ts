import { z } from "zod";
import { getI18N } from "@/i18n";
import type { PropsLang } from "@/types/currentLang.interface";

export const contactSchema = ({ currentLocale }: PropsLang) => {
	const i18n = getI18N({ currentLocale });
	const schema = z.object({
		name: z.string().min(5, i18n.FORM.FORM_VALID_NAME),
		email: z.email(i18n.FORM.FORM_VALID_EMAIL),
		phone: z
			.string()
			.min(7, i18n.FORM.FORM_VALID_PHONE_MIN)
			.max(20, i18n.FORM.FORM_VALID_PHONE_MAX)
			.regex(/^\+?[0-9\s\-()]+$/, i18n.FORM.FORM_VALID_PHONE_REGEX),
		// .optional() alone only forgives `undefined` - react-hook-form's
		// defaultValue for this field is "" (empty string), which still hits
		// .min(7) and fails. Empty/untouched must pass; a value, if given,
		// still has to satisfy min/max.
		moreInformation: z
			.string()
			.max(260, i18n.FORM.FORM_VALID_MORE_INFORMATION_MAX)
			.optional()
			.refine((val) => !val || val.length >= 7, {
				message: i18n.FORM.FORM_VALID_MORE_INFORMATION_MIN,
			}),
	});
	return schema;
};
