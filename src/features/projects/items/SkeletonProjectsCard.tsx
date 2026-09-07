import { Skeleton } from "@/components/ui/skeleton";

export const SkeletonProjectsCard = () => {
	return (
		<div className="w-full">
			<div className="flex flex-col w-full rounded-xl border border-border bg-card overflow-hidden shadow-sm">
				{/* Figure skeleton - Responsive height */}
				<div className="relative overflow-hidden">
					<Skeleton className="w-full h-32 xs:h-36 sm:h-40 md:h-44 lg:h-48 xl:h-52 rounded-none" />

					{/* Botones skeleton - Responsive positioning and size */}
					<div className="absolute top-1 right-1 xs:top-2 xs:right-2 flex gap-1 xs:gap-2">
						<div className="rounded-lg bg-muted p-1 xs:p-2">
							<Skeleton className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
						</div>
						<div className="rounded-lg bg-muted p-1 xs:p-2">
							<Skeleton className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
						</div>
					</div>
				</div>

				{/* Card body skeleton - Responsive padding */}
				<div className="flex flex-col p-3 xs:p-4 sm:p-5 md:p-6">
					{/* Título y badge skeleton - Responsive sizes */}
					<div className="flex justify-between items-start mb-2 xs:mb-3 sm:mb-4">
						<div className="flex items-center gap-1 xs:gap-2 flex-wrap">
							<Skeleton className="h-4 xs:h-5 sm:h-6 w-20 xs:w-24 sm:w-32" />
							<Skeleton className="h-3 xs:h-4 sm:h-5 w-12 xs:w-16 sm:w-20 rounded-full" />
						</div>
					</div>

					{/* Descripción skeleton - Responsive lines and spacing */}
					<div className="space-y-1 xs:space-y-2 mb-3 xs:mb-4">
						<Skeleton className="h-3 xs:h-4 w-full" />
						<Skeleton className="h-3 xs:h-4 w-4/5" />
						<Skeleton className="h-3 xs:h-4 w-3/5 sm:block hidden" />
					</div>

					{/* Card actions skeleton - Responsive avatar sizes */}
					<div className="flex flex-wrap items-center justify-start">
						<div className="flex -space-x-2 xs:-space-x-3">
							{/* biome-ignore lint/react/useKey */}
							{[...Array(5)].map((_, idx) => (
								<div key={`skeleton-${idx}`}>
									<Skeleton className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 rounded-full border-2 border-card" />
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
