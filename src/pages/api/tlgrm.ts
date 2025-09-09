import { api } from "@/config/api";

import type { APIRoute } from "astro";
import { API_SECRET_TOKEN } from "astro:env/server";

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();
  const name = data.get("name");
  const email = data.get("email");
  const phone = data.get("phone");
  const moreInformation = data.get("moreInformation");

  await api.post(
    "/tlgrm",
    {
      name,
      email,
      phone,
      moreInformation,
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
        name,
        email,
        phone,
        moreInformation,
      },
    }),
    {
      status: 200,
    },
  );
};
