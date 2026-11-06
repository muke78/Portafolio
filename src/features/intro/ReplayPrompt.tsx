import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getI18N } from "@/i18n";
import {
	type IntroPref,
	readIntroPref,
	requestIntroOnce,
	writeIntroPref,
} from "@/lib/introPrefs";
import type { PropsLang } from "@/types/currentLang.interface";

/**
 * El final de la historia, en el pie de pagina (es una isla `client:visible`: se hidrata
 * al llegar abajo). Dos piezas:
 *
 *  1. El enlace fijo «Volver a ver el origen del universo»: vuelve a pedir la puerta UNA
 *     vez (`sessionStorage`), sin tocar la preferencia guardada.
 *  2. La pregunta, solo si la persona aun no ha contestado y la introduccion existe
 *     (movimiento permitido): «¿Quieres volver a ver la historia desde la particula?».
 *       Si  -> "replay": la proxima vez que entre o actualice, empieza en el punto cero.
 *       No  -> "skip":   entra directo, con las estrellas ya esparcidas.
 *     Es un aviso NO modal (no roba el foco ni tapa la pagina) que confirma la eleccion.
 */
export const ReplayPrompt = ({ currentLocale }: PropsLang) => {
	const t = getI18N({ currentLocale }).INTRO;
	const titleId = useId();
	const [enabled, setEnabled] = useState(true);
	const [asking, setAsking] = useState(false);
	const [saved, setSaved] = useState<IntroPref | null>(null);

	useEffect(() => {
		const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		// Sin movimiento no hay introduccion: ni pregunta ni enlace.
		if (calm) {
			setEnabled(false);
			return;
		}
		if (readIntroPref() === null) setAsking(true);
	}, []);

	// La confirmacion se retira sola.
	useEffect(() => {
		if (!saved) return;
		const id = window.setTimeout(() => setSaved(null), 4000);
		return () => window.clearTimeout(id);
	}, [saved]);

	const answer = (pref: IntroPref) => {
		writeIntroPref(pref);
		setAsking(false);
		setSaved(pref);
	};

	const replayNow = () => {
		requestIntroOnce();
		// Un ancla en la URL desactiva la puerta (enlaces directos): se quita.
		history.replaceState(null, "", location.pathname + location.search);
		window.scrollTo(0, 0);
		location.reload();
	};

	return (
		<>
			{enabled && (
				<button
					type="button"
					onClick={replayNow}
					className="text-left text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
				>
					{t.REPLAY_LINK}
				</button>
			)}

			{asking && (
				<Card
					role="group"
					aria-labelledby={titleId}
					className="fixed right-4 bottom-4 left-4 z-50 sm:right-auto sm:left-6 sm:w-96"
				>
					<CardHeader>
						<CardTitle id={titleId}>{t.REPLAY_TITLE}</CardTitle>
						<CardDescription>{t.REPLAY_TEXT}</CardDescription>
					</CardHeader>
					<CardFooter className="flex flex-wrap gap-2">
						<Button onClick={() => answer("replay")}>{t.REPLAY_YES}</Button>
						<Button variant="outline" onClick={() => answer("skip")}>
							{t.REPLAY_NO}
						</Button>
					</CardFooter>
				</Card>
			)}

			<output className="sr-only">
				{saved === "replay" && t.REPLAY_SAVED_YES}
				{saved === "skip" && t.REPLAY_SAVED_NO}
			</output>
			{saved && (
				<p
					aria-hidden="true"
					className="fixed right-4 bottom-4 left-4 z-50 rounded-xl border border-border bg-card p-4 text-sm text-foreground sm:right-auto sm:left-6 sm:w-96"
				>
					{saved === "replay" ? t.REPLAY_SAVED_YES : t.REPLAY_SAVED_NO}
				</p>
			)}
		</>
	);
};
