import { api } from "@/config/api";

import type { APIRoute } from "astro";
import { API_SECRET_TOKEN } from "astro:env/server";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const currentLocale = url.searchParams.get("currentLocale");

  const { data } = await api.get(
    `/experiences?currentLocale=${currentLocale}`,
    {
      headers: {
        Authorization: `Bearer ${API_SECRET_TOKEN}`,
      },
    },
  );

  return new Response(JSON.stringify({ data }), { status: 200 });
};
