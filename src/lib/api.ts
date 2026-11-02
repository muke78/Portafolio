import { VITE_API_URL } from "astro:env/client";
import axios from "axios";

export const api = axios.create({
	baseURL: VITE_API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});
