import ReactCountryFlag from "react-country-flag";
import type { CountryFlagProps } from "@/interfaces/currentLang.interface";

export const CountryFlag = ({
	countryCode,
	size = "1em",
}: CountryFlagProps) => {
	const isValidCode = countryCode && /^[A-Z]{2}$/.test(countryCode);

	return isValidCode ? (
		<ReactCountryFlag
			countryCode={countryCode}
			svg
			style={{ width: size, height: size }}
			title={countryCode}
		/>
	) : (
		<span className="w-4 h-4">🌐</span>
	);
};
