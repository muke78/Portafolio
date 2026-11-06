import type { Cleanup, MotionTools } from "./core";

/**
 * "Skip the introduction": a button that floats and whose words come out of noise. It
 * uses GSAP's ScrambleTextPlugin (`scrambleText`): the letters flicker through hexadecimal
 * and symbols and settle into the real text. It runs when the page loads and each time
 * the cursor (or the keyboard focus) arrives - and only then; the rest of the time the
 * button just floats, so it is not a distraction.
 *
 * The accessible name stays the real words (aria-label) and the animated letters are
 * decoration (aria-hidden), so a screen reader never hears the noise.
 */

/** What the letters flicker through: hexadecimal first, a few symbols for grit. */
const NOISE = "0123456789ABCDEF#%&@$*+=<>?/";

export const corruptLabel = (
	gsap: MotionTools["gsap"],
	button: HTMLElement,
): Cleanup => {
	const label = (button.textContent ?? "").trim();
	if (!label) return () => {};

	const hadLabel = button.hasAttribute("aria-label");
	if (!hadLabel) button.setAttribute("aria-label", label);
	const original = Array.from(button.childNodes);
	// The width never changes while the letters scramble (no jumping layout).
	button.style.minWidth = `${Math.ceil(button.getBoundingClientRect().width)}px`;

	const text = document.createElement("span");
	text.setAttribute("aria-hidden", "true");
	text.style.whiteSpace = "pre";
	text.textContent = label;
	button.replaceChildren(text);

	// It floats: two slow, unequal drifts.
	const floatY = gsap.to(button, {
		y: -4,
		duration: 2.6,
		ease: "sine.inOut",
		yoyo: true,
		repeat: -1,
	});
	const floatX = gsap.to(button, {
		x: 3,
		duration: 3.7,
		ease: "sine.inOut",
		yoyo: true,
		repeat: -1,
	});

	// Signal-loss look while it scrambles: red/violet fringes and a slight shake.
	const fringe =
		"1.5px 0 color-mix(in oklch, var(--primary) 85%, transparent), -1.5px 0 color-mix(in oklch, var(--galaxy-ember) 85%, transparent)";
	let run: gsap.core.Timeline | undefined;
	const scramble = (duration: number) => {
		run?.kill();
		text.style.textShadow = fringe;
		text.style.fontFamily = "var(--font-mono)";
		run = gsap
			.timeline({
				onComplete: () => {
					text.style.textShadow = "";
					text.style.fontFamily = "";
					gsap.set(text, { clearProps: "x,skewX" });
				},
			})
			.to(
				text,
				{
					duration,
					scrambleText: {
						text: label,
						chars: NOISE,
						speed: 0.5,
						revealDelay: 0.15,
					},
					ease: "none",
				},
				0,
			)
			// A jittery shake for as long as it lasts.
			.to(
				text,
				{
					x: 2,
					skewX: -8,
					duration: 0.07,
					repeat: Math.round(duration / 0.07) - 1,
					yoyo: true,
					ease: "none",
				},
				0,
			);
	};

	// On load (the gate has just appeared) and every time it is touched.
	scramble(1.4);
	const onEnter = () => scramble(0.9);
	button.addEventListener("pointerenter", onEnter);
	button.addEventListener("focus", onEnter);

	return () => {
		run?.kill();
		floatX.kill();
		floatY.kill();
		button.removeEventListener("pointerenter", onEnter);
		button.removeEventListener("focus", onEnter);
		gsap.set(button, { clearProps: "x,y" });
		button.style.minWidth = "";
		button.replaceChildren(...original);
		if (!hadLabel) button.removeAttribute("aria-label");
	};
};
