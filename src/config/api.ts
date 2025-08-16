import axios from "axios";

const API_URL =
  "https://backend-portafolio-opal.vercel.app/de342e8b-2813-46d1-8a8e-4a1c41e62b72";
//const API_URL = "http://localhost:3000/de342e8b-2813-46d1-8a8e-4a1c41e62b72";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
