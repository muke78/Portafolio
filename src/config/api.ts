import { VITE_URL_API_PRODUCTION } from "astro:env/client";
import axios from "axios";

export const api = axios.create({
  baseURL: VITE_URL_API_PRODUCTION,
  headers: {
    "Content-Type": "application/json",
  },
});
