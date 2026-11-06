// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReplayPrompt } from "@/features/intro/ReplayPrompt";
import { getI18N } from "@/i18n";
import {
	INTRO_ONCE_KEY,
	readIntroPref,
	writeIntroPref,
} from "@/lib/introPrefs";

const es = getI18N({ currentLocale: "es" }).INTRO;

const motion = (reduce: boolean) =>
	vi.stubGlobal("matchMedia", (query: string) => ({
		matches: query.includes("prefers-reduced-motion") ? reduce : false,
		media: query,
		addEventListener() {},
		removeEventListener() {},
	}));

beforeEach(() => {
	localStorage.clear();
	sessionStorage.clear();
	motion(false);
	vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => {
	vi.useRealTimers();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe("ReplayPrompt: la pregunta del pie", () => {
	it("la primera vez pregunta si quiere volver a ver el origen, con dos respuestas claras", async () => {
		render(<ReplayPrompt currentLocale="es" />);
		const group = await screen.findByRole("group", { name: es.REPLAY_TITLE });
		expect(group).toHaveTextContent(es.REPLAY_TEXT);
		expect(
			screen.getByRole("button", { name: es.REPLAY_YES }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: es.REPLAY_NO }),
		).toBeInTheDocument();
	});

	it("«Sí, desde el principio» guarda replay y lo confirma", async () => {
		render(<ReplayPrompt currentLocale="es" />);
		await userEvent.click(
			await screen.findByRole("button", { name: es.REPLAY_YES }),
		);
		expect(readIntroPref()).toBe("replay");
		expect(screen.queryByRole("group")).toBeNull();
		// Lo anuncia la region de estado (y se ve en pantalla).
		expect(screen.getByRole("status")).toHaveTextContent(es.REPLAY_SAVED_YES);
	});

	it("«No, ir directo» guarda skip y lo confirma", async () => {
		render(<ReplayPrompt currentLocale="es" />);
		await userEvent.click(
			await screen.findByRole("button", { name: es.REPLAY_NO }),
		);
		expect(readIntroPref()).toBe("skip");
		expect(screen.getByRole("status")).toHaveTextContent(es.REPLAY_SAVED_NO);
	});

	it("la confirmacion se retira sola", async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
		render(<ReplayPrompt currentLocale="es" />);
		await userEvent.click(
			await screen.findByRole("button", { name: es.REPLAY_NO }),
		);
		expect(screen.getByRole("status")).toHaveTextContent(es.REPLAY_SAVED_NO);
		act(() => {
			vi.advanceTimersByTime(4100);
		});
		expect(screen.getByRole("status")).toHaveTextContent("");
	});

	it("no vuelve a preguntar a quien ya contesto", () => {
		writeIntroPref("skip");
		render(<ReplayPrompt currentLocale="es" />);
		expect(screen.queryByRole("group")).toBeNull();
	});

	it("con movimiento reducido no hay introduccion: ni pregunta ni enlace", () => {
		motion(true);
		render(<ReplayPrompt currentLocale="es" />);
		expect(screen.queryByRole("group")).toBeNull();
		expect(screen.queryByRole("button", { name: es.REPLAY_LINK })).toBeNull();
	});

	it("si el almacenamiento esta bloqueado no rompe el pie", async () => {
		vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
			throw new Error("blocked");
		});
		render(<ReplayPrompt currentLocale="es" />);
		await userEvent.click(
			await screen.findByRole("button", { name: es.REPLAY_YES }),
		);
		expect(screen.queryByRole("group")).toBeNull();
	});
});

describe("ReplayPrompt: el enlace fijo", () => {
	it("esta en el servidor (SSR) aunque la pregunta no", async () => {
		const { renderToString } = await import("react-dom/server");
		const html = renderToString(<ReplayPrompt currentLocale="es" />);
		expect(html).toContain(es.REPLAY_LINK);
		expect(html).not.toContain(es.REPLAY_TITLE);
	});

	it("pide la puerta una vez, sin cambiar la preferencia, y recarga desde arriba sin ancla", async () => {
		writeIntroPref("skip");
		const reload = vi.fn();
		vi.stubGlobal("location", {
			pathname: "/es/home",
			search: "",
			hash: "#projects",
			reload,
		});
		const replaceState = vi.spyOn(history, "replaceState");
		render(<ReplayPrompt currentLocale="es" />);
		await userEvent.click(
			await screen.findByRole("button", { name: es.REPLAY_LINK }),
		);
		expect(sessionStorage.getItem(INTRO_ONCE_KEY)).toBe("1");
		expect(readIntroPref()).toBe("skip");
		expect(replaceState).toHaveBeenCalledWith(null, "", "/es/home");
		expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
		expect(reload).toHaveBeenCalledTimes(1);
	});
});
