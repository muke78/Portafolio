import { api } from "@/config/api";

import type { APIRoute } from "astro";
// import { VITE_API_URL } from "astro:env/client";
import { API_SECRET_TOKEN } from "astro:env/server";

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();
  const name = data.get("name");
  const job = data.get("job");
  const description = data.get("description");

  await api.post(
    "/comments",
    { name, job, description },
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
        job,
        description,
      },
    }),
    {
      status: 200,
    },
  );
};
