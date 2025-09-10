import { API_SECRET_TOKEN } from "astro:env/server";

import type { APIRoute } from "astro";
import { api } from "@/config/api";

export const GET: APIRoute = async ({ request }) => {
	try {
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

		return new Response(JSON.stringify(data), { status: 200 });
	} catch (error) {
		console.error("Error fetching experiences:", error.message);
		return new Response(
			JSON.stringify({
				message: "Backend no disponible, intenta más tarde.",
				error,
			}),
			{ status: 503 },
		);
	}
};
