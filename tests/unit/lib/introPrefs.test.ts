// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { INTRO_GATE_SCRIPT } from "@/lib/inlineScripts";
import {
	INTRO_KEY,
	INTRO_ONCE_KEY,
	INTRO_SEEN_KEY,
	markIntroSeen,
	readIntroPref,
	requestIntroOnce,
	writeIntroPref,
} from "@/lib/introPrefs";

beforeEach(() => {
	localStorage.clear();
	sessionStorage.clear();
	document.documentElement.className = "";
});
afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe("introPrefs", () => {
	it("sin respuesta no hay preferencia (primera visita)", () => {
		expect(readIntroPref()).toBeNull();
	});

	it("guarda y lee las dos respuestas", () => {
		expect(writeIntroPref("replay")).toBe(true);
		expect(readIntroPref()).toBe("replay");
		writeIntroPref("skip");
		expect(readIntroPref()).toBe("skip");
	});

	it("ignora un valor ajeno o corrupto", () => {
		localStorage.setItem(INTRO_KEY, "quiza");
		expect(readIntroPref()).toBeNull();
	});

	it("si el almacenamiento esta bloqueado no lanza: lee null y escribe false", () => {
		vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
			throw new Error("blocked");
		});
		vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
			throw new Error("blocked");
		});
		expect(readIntroPref()).toBeNull();
		expect(writeIntroPref("skip")).toBe(false);
		expect(requestIntroOnce()).toBe(false);
	});

	it("pedirla una vez usa la sesion, no la preferencia guardada", () => {
		writeIntroPref("skip");
		expect(requestIntroOnce()).toBe(true);
		expect(sessionStorage.getItem(INTRO_ONCE_KEY)).toBe("1");
		expect(readIntroPref()).toBe("skip");
	});
});

/** Corre el script del <head> como lo haria el navegador, con la URL y el movimiento dados. */
const runGate = ({
	hash = "",
	reduce = false,
	reload = false,
}: {
	hash?: string;
	reduce?: boolean;
	reload?: boolean;
} = {}) => {
	vi.stubGlobal("matchMedia", () => ({ matches: reduce }));
	vi.spyOn(performance, "getEntriesByType").mockReturnValue([
		{ type: reload ? "reload" : "navigate" } as unknown as PerformanceEntry,
	]);
	window.history.replaceState(null, "", `/es/home${hash}`);
	new Function(INTRO_GATE_SCRIPT)();
	return document.documentElement.classList.contains("intro-on");
};

describe("INTRO_GATE_SCRIPT (el <head>, antes del primer pintado)", () => {
	it("usa las mismas claves que introPrefs", () => {
		expect(INTRO_GATE_SCRIPT).toContain(`"${INTRO_KEY}"`);
		expect(INTRO_GATE_SCRIPT).toContain(`"${INTRO_ONCE_KEY}"`);
		expect(INTRO_GATE_SCRIPT).toContain(`"${INTRO_SEEN_KEY}"`);
	});

	it("primera visita: pone la puerta", () => {
		expect(runGate()).toBe(true);
	});

	it("«desde el principio» (replay): pone la puerta", () => {
		writeIntroPref("replay");
		expect(runGate()).toBe(true);
	});

	it("«ir directo» (skip): no hay puerta, entra al header", () => {
		writeIntroPref("skip");
		expect(runGate()).toBe(false);
	});

	it("con skip, el enlace del pie la pide una vez y se consume", () => {
		writeIntroPref("skip");
		requestIntroOnce();
		expect(runGate()).toBe(true);
		expect(sessionStorage.getItem(INTRO_ONCE_KEY)).toBeNull();
		document.documentElement.className = "";
		expect(runGate()).toBe(false);
	});

	it("quien aun no contesta no ve el punto cero otra vez al volver de un proyecto o cambiar de idioma", () => {
		markIntroSeen();
		expect(sessionStorage.getItem(INTRO_SEEN_KEY)).toBe("1");
		expect(runGate()).toBe(false);
	});

	it("pero una recarga si la repite (quien pidio verla desde el principio)", () => {
		writeIntroPref("replay");
		markIntroSeen();
		expect(runGate({ reload: true })).toBe(true);
	});

	it("una recarga no la repite a quien eligio ir directo", () => {
		writeIntroPref("skip");
		markIntroSeen();
		expect(runGate({ reload: true })).toBe(false);
	});

	it("una pestana nueva (sin marca de sesion) la vuelve a mostrar a quien pidio verla", () => {
		writeIntroPref("replay");
		expect(runGate()).toBe(true);
	});

	it("con movimiento reducido nunca hay puerta", () => {
		expect(runGate({ reduce: true })).toBe(false);
	});

	it("un enlace directo con ancla (#projects) entra sin puerta", () => {
		expect(runGate({ hash: "#projects" })).toBe(false);
	});

	it("si el almacenamiento falla, la persona igual ve la puerta (no se rompe el <head>)", () => {
		vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
			throw new Error("blocked");
		});
		expect(runGate()).toBe(true);
	});

	it("si el motor no arranca en 5 s, la puerta se quita sola", () => {
		vi.useFakeTimers();
		runGate();
		expect(document.documentElement.classList.contains("intro-on")).toBe(true);
		vi.advanceTimersByTime(5000);
		expect(document.documentElement.classList.contains("intro-on")).toBe(false);
		vi.useRealTimers();
	});
});
