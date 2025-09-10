import { API_SECRET_TOKEN } from "astro:env/server";

import type { APIRoute } from "astro";
import { api } from "@/config/api";

export const POST: APIRoute = async ({ request }) => {
	try {
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
	} catch (error) {
		console.error("Error posting tlgrm:", error.message);
		return new Response(
			JSON.stringify({ message: "No se pudo enviar la información.", error }),
			{ status: 503 },
		);
	}
};
