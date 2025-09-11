import { motion, type Variants } from "framer-motion";
import { MessageSquare, Quote } from "lucide-react";

import { useEffect, useState } from "react";
import { getI18N } from "@/i18n";
import type {
	PropsLang,
	Testimonial,
} from "@/interfaces/currentLang.interface";
import { CountryFlag } from "@/components/features/opinions/Items/CountryFlag";

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.2,
		},
	},
};

const cardVariants: Record<"left" | "bottom", Variants> = {
	left: {
		hidden: { opacity: 0, x: -50, scale: 0.95 },
		visible: {
			opacity: 1,
			x: 0,
			scale: 1,
			transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
		},
	},
	bottom: {
		hidden: { opacity: 0, y: 50, scale: 0.95 },
		visible: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
		},
	},
};

const emptyStateVariants: Variants = {
	hidden: { opacity: 0, y: 30 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.8,
			ease: [0.25, 0.1, 0.25, 1],
		},
	},
};

export const Opinions = ({ currentLocale }: PropsLang) => {
	const [data, setData] = useState<Testimonial[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const i18n = getI18N({ currentLocale });

	useEffect(() => {
		async function fetchData() {
			try {
				const result = await fetch("/api/comments");
				const comments = await result.json();
				setData(comments.data as Testimonial[]);
			} catch (error) {
				console.error("Error al cargar comentarios:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, []);

	if (loading) return <span className="loading loading-ring loading-xl"></span>;

	return (
		<div className="relative w-full overflow-hidden p-4">
			{/* Header Section */}
			<motion.div
				className="flex flex-col items-center text-center max-w-4xl mx-auto mb-12"
				initial={{ opacity: 0, y: -50 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
			>
				{/* Subtitle */}
				<motion.div
					className="inline-block px-4 py-2 bg-primary/20 text-base-content text-sm rounded-full mb-6 backdrop-blur-sm border border-primary/20"
					initial={{ scale: 0, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ delay: 0.3, duration: 0.5, ease: "backOut" }}
				>
					{i18n.OPINIONS.OPINIONS_SUBTITLE}
				</motion.div>

				{/* Title */}
				<motion.h2
					className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-base-content to-base-content/70 bg-clip-text text-transparent"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4, duration: 0.6 }}
				>
					{i18n.OPINIONS.OPINIONS_TITLE}
				</motion.h2>

				{/* Sub-subtitle */}
				<motion.p
					className="text-xl text-base-content/90 font-medium max-w-2xl mx-auto mb-6"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5, duration: 0.6 }}
				>
					{i18n.OPINIONS.OPINIONS_SUB_SUBTILE}
				</motion.p>

				{/* Botón con icono */}
				<motion.a
					type="button"
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					className="btn btn-primary btn-md flex items-center gap-2"
					href={`/${currentLocale}/comments`}
					aria-label={i18n.OPINIONS.OPINIONS_REDIRECT_COMMENTS_PAGE}
				>
					<MessageSquare className="w-5 h-5" />
					{i18n.OPINIONS.OPINIONS_REDIRECT_COMMENTS_PAGE}
				</motion.a>
			</motion.div>

			{/* Content Section */}
			<motion.div
				initial="hidden"
				animate="visible"
				variants={containerVariants}
				viewport={{ once: true }}
			>
				{data.length === 0 ? (
					// Estado vacío mejorado
					<motion.div
						className="flex flex-col items-center justify-center min-h-[400px] px-8 py-12"
						variants={emptyStateVariants}
						aria-live="polite"
					>
						{/* Contenedor de imagen con decoraciones */}
						<motion.div
							className="relative mb-8"
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{
								duration: 0.8,
								ease: "easeOut",
								delay: 0.2,
							}}
						>
							{/* Imagen principal */}
							<motion.img
								src="/no_data.svg"
								alt="No hay información disponible"
								aria-label="No hay información disponible por el momento"
								className="w-52 h-52 mx-auto opacity-70"
								animate={{
									y: [0, -12, 0],
									scale: [1, 1.05, 1],
								}}
								transition={{
									duration: 4,
									repeat: Infinity,
									ease: "easeInOut",
								}}
							/>

							{/* Círculo decorativo giratorio */}
							<motion.div
								className="absolute -inset-6 rounded-full border-2 border-dashed border-primary/30"
								animate={{ rotate: 360 }}
								transition={{
									duration: 20,
									repeat: Infinity,
									ease: "linear",
								}}
							/>

							{/* Partículas decorativas */}
							<motion.div
								className="absolute -top-2 -right-2 w-3 h-3 bg-primary/40 rounded-full"
								animate={{
									scale: [1, 1.5, 1],
									opacity: [0.4, 0.8, 0.4],
								}}
								transition={{
									duration: 2,
									repeat: Infinity,
									delay: 0,
								}}
							/>
							<motion.div
								className="absolute -bottom-2 -left-2 w-2 h-2 bg-secondary/40 rounded-full"
								animate={{
									scale: [1, 1.3, 1],
									opacity: [0.4, 0.7, 0.4],
								}}
								transition={{
									duration: 2,
									repeat: Infinity,
									delay: 1,
								}}
							/>
						</motion.div>

						{/* Texto mejorado */}
						<motion.div
							className="text-center space-y-4 max-w-md"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.6, duration: 0.6 }}
						>
							<h3 className="text-2xl font-semibold text-base-content/80 mb-3">
								{i18n.OPINIONS.OPINIONS_NOT_FOUND}
							</h3>
							<p className="text-sm text-primary/90 leading-relaxed">
								{i18n.OPINIONS.OPINIONS_NOT_FOUND_DESCRIPTION}
							</p>
						</motion.div>
					</motion.div>
				) : (
					// Grid de testimonios mejorado
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-6 p-4">
						{data.map((testimonial, _index) => (
							<motion.div
								key={testimonial.comment_id}
								variants={
									cardVariants[
										testimonial.direction as keyof typeof cardVariants
									]
								}
								whileHover={{
									y: -8,
									scale: 1.03,
									transition: { duration: 0.5, ease: "easeInOut" },
								}}
								className="group relative break-inside-avoid card bg-base-100 shadow-lg border border-base-300 hover:shadow-xl hover:border-secondary/30 transition-discrete duration-500 overflow-hidden"
							>
								{/* Header con Quote y Badge de fecha */}
								<div className="card-body p-6">
									<div className="flex items-start justify-between mb-4">
										<motion.div
											className="flex-shrink-0 p-2 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 group-hover:scale-110 group-hover:rotate-12 transition-discrete duration-500 ease-in-out"
											transition={{ duration: 0.9 }}
										>
											<Quote className="w-8 h-8 text-secondary" />
										</motion.div>

										{/* Badge de fecha */}
										<div className="badge badge-secondary badge-sm text-base-200">
											{new Date(testimonial.created_at).toLocaleDateString(
												"es-ES",
												{
													day: "numeric",
													month: "short",
													year: "numeric",
												},
											)}
										</div>
									</div>

									{/* Información del usuario */}
									<div className="flex items-center gap-3 mb-4">
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1">
												<h3 className="font-bold text-base-content text-lg leading-tight truncate">
													{testimonial.name}
												</h3>
												<CountryFlag
													countryCode={testimonial.country_flag}
													size="1em"
												/>
											</div>
											<p className="text-sm text-base-content/60 font-medium truncate">
												{testimonial.job}
											</p>
										</div>
									</div>

									{/* Contenido del testimonio */}
									<div className="flex-1">
										<p className="text-base-content/80 leading-relaxed text-sm  mb-4">
											"{testimonial.description}"
										</p>
									</div>

									{/* Footer con indicador de país completo */}
									<div className="flex items-center justify-between pt-4 border-t border-base-300/50">
										<div className="flex items-center gap-2 text-xs text-base-content/50">
											{/* Bandera del país */}
											<CountryFlag
												countryCode={testimonial.country_flag}
												size="1em"
											/>
											<span className="text-base-content/80 text-sm">
												{testimonial.country
													? testimonial.country
													: i18n.OPINIONS.OPINIONS_NOT_FOUND_COUNTRY}
											</span>
										</div>
									</div>
								</div>

								{/* Indicador animado */}
								<motion.div
									className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-accent"
									initial={{ scaleX: 0, opacity: 0 }}
									whileHover={{
										scaleX: 1,
										opacity: 1,
									}}
									transition={{
										duration: 0.4,
										ease: "easeOut",
									}}
								/>

								{/* Efecto de brillo sutil */}
								<motion.div
									className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
									initial={false}
								/>
							</motion.div>
						))}
					</div>
				)}
			</motion.div>
		</div>
	);
};
