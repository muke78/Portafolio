import { getI18N } from "@/i18n";
import type { PropsLang } from "@/interfaces/currentLang.interface";

import { z } from "zod";

export const opinionsSchema = ({ currentLocale }: PropsLang) => {
  const i18n = getI18N({ currentLocale });
  const schema = z.object({
    name: z.string().min(5, i18n.FORM.FORM_VALID_NAME),
    job: z.string(),
    description: z
      .string()
      .min(14, i18n.OPINIONS.OPINIONS_FORM_VALID_MORE_INFORMATION_MIN)
      .max(500, i18n.OPINIONS.OPINIONS_FORM_VALID_MORE_INFORMATION_MAX),
  });
  return schema;
};
