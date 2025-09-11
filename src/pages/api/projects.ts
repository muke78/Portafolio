import { API_SECRET_TOKEN } from "astro:env/server";

import type { APIRoute } from "astro";
import { api } from "@/config/api";

export const GET: APIRoute = async ({ request }) => {
	try {
		const url = new URL(request.url);
		const currentLocale = url.searchParams.get("currentLocale");

		const { data } = await api.get(`/projects?currentLocale=${currentLocale}`, {
			headers: {
				Authorization: `Bearer ${API_SECRET_TOKEN}`,
			},
		});

		return new Response(JSON.stringify(data), { status: 200 });
	} catch (error) {
		return new Response(
			JSON.stringify({
				message: "No se pudo obtener los proyectos",
			}),
			{ status: 503 },
		);
	}
};
