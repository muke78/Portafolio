import type { APIRoute } from "astro";
import { DEFAULT_LOCALE } from "@/i18n/locales";

export const GET: APIRoute = ({ currentLocale, redirect }) =>
	redirect(`/${currentLocale ?? DEFAULT_LOCALE}/home`, 302);
