import { api } from "@/config/api";

import type { APIRoute } from "astro";
import { API_SECRET_TOKEN } from "astro:env/server";

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();

  await api.post(
    "/tlgrm",
    {
      name: body.name,
      email: body.email,
      phone: body.phone,
      moreInformation: body.moreInformation,
    },
    {
      headers: {
        Authorization: `Bearer ${API_SECRET_TOKEN}`,
      },
    },
  );

  return new Response(
    JSON.stringify({
      message: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        moreInformation: body.moreInformation,
      },
    }),
    {
      status: 200,
    },
  );
};
