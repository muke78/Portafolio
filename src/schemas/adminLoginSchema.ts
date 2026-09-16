import { z } from "zod";

// Mismo shape que Backend_Portafolio's loginInputSchema (schemas/users.ts) -
// valida aquí también para rechazar entradas obviamente inválidas antes de
// gastar una llamada de red a Hono, y para dar feedback inmediato en el
// formulario (este archivo se importa tal cual desde el <script> de
// login.astro, sin build step aparte).
export const adminLoginSchema = z.object({
	email: z.email("Correo inválido"),
	password: z.string().min(1, "La contraseña es requerida"),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
