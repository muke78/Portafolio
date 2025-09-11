import { API_SECRET_TOKEN } from "astro:env/server";

import type { APIRoute } from "astro";
import { api } from "@/config/api";

export const POST: APIRoute = async ({ request }) => {
	try {
		const body = await request.json();
		await api.post(
			"/comments",
			{
				name: body.name,
				job: body.job,
				description: body.description,
				country: body.country,
				country_flag: body.country_flag,
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
					job: body.job,
					description: body.description,
				},
			}),
			{
				status: 200,
			},
		);
	} catch (error) {
		return new Response(
			JSON.stringify({ message: "No se pudo enviar el comentario." }),
			{ status: 503 },
		);
	}
};

export const GET: APIRoute = async () => {
	try {
		const { data } = await api.get("/comments", {
			headers: {
				Authorization: `Bearer ${API_SECRET_TOKEN}`,
			},
		});

		return new Response(JSON.stringify(data), { status: 200 });
	} catch (error) {
		return new Response(
			JSON.stringify({
				message: "No se pudo obtener los comentarios",
			}),
			{ status: 503 },
		);
	}
};
