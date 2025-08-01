import { getI18N } from "@/i18n";

import { z } from "zod";

interface PropsLang {
  currentLocale: string;
}

export const contactSchema = ({ currentLocale }: PropsLang) => {
  const i18n = getI18N({ currentLocale });
  const schema = z.object({
    name: z.string().min(5, i18n.FORM.FORM_VALID_NAME),
    email: z.string().email(i18n.FORM.FORM_VALID_EMAIL),
    phone: z
      .string()
      .min(7, i18n.FORM.FORM_VALID_PHONE_MIN)
      .max(20, i18n.FORM.FORM_VALID_PHONE_MAX)
      .regex(/^\+?[0-9\s\-()]+$/, i18n.FORM.FORM_VALID_PHONE_REGEX),
    moreInformation: z
      .string()
      .min(7, i18n.FORM.FORM_VALID_MORE_INFORMATION_MIN)
      .max(260, i18n.FORM.FORM_VALID_MORE_INFORMATION_MAX),
  });
  return schema;
};
