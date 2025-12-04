import { motion } from "framer-motion";

export const Bubble = ({ className, position, duration = 5, delay = 0 }) => {
	return (
		<motion.div
			// Clases originales + z-index para que esté en el fondo
			className={`absolute xl:size-64 lg:size-48 md:size-28 sm:size-20 size-12 rounded-full opacity-40 z-[-1] blur-[100px] ${className} ${position}`}
			initial={{
				opacity: 0,
				scale: 0.5,
			}}
			animate={{
				opacity: [0.6, 0.7, 0.6],
				scale: [0.895, 1.23, 0.942],
			}}
			transition={{
				delay,
				duration,
				repeat: Infinity,
				repeatType: "reverse",
				ease: "easeInOut",
			}}
		/>
	);
};
