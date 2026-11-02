import { Skeleton } from "@/components/ui/skeleton";

/**
 * Placeholder card matching the shape of a real testimonial card in
 * Opinions.tsx's marquee, for the initial /api/comments fetch instead
 * of a plain spinner - consistent with SkeletonProjectsCard's pattern.
 */
export const SkeletonTestimonialCard = () => {
	return (
		<div className="w-[340px] shrink-0 rounded-xl bg-card border border-border overflow-hidden">
			<div className="flex flex-col p-6">
				<div className="flex items-start justify-between mb-4">
					<Skeleton className="w-10 h-10 rounded-lg" />
					<Skeleton className="w-20 h-5 rounded-full" />
				</div>

				<div className="flex items-center gap-3 mb-4">
					<div className="flex-1 min-w-0 space-y-2">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-3 w-24" />
					</div>
				</div>

				<div className="space-y-2 mb-4">
					<Skeleton className="h-3 w-full" />
					<Skeleton className="h-3 w-full" />
					<Skeleton className="h-3 w-3/4" />
				</div>

				<div className="flex items-center justify-between pt-4 border-t border-border">
					<Skeleton className="h-3 w-20" />
				</div>
			</div>
		</div>
	);
};
