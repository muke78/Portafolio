import { Skeleton } from "@/components/ui/skeleton";

/** Same shape as ItemDataProjects' card: image, category, title, 3 lines, stack. */
export const SkeletonProjectsCard = () => (
	<div className="flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card">
		<Skeleton className="h-[200px] w-full rounded-none" />
		<div className="flex flex-col p-6">
			<Skeleton className="h-3.5 w-20" />
			<Skeleton className="mt-3 h-7 w-3/5" />
			<div className="mt-4 space-y-2">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-11/12" />
				<Skeleton className="h-4 w-2/3" />
			</div>
			<div className="mt-6 flex -space-x-2 border-t border-border pt-5">
				{[0, 1, 2, 3, 4].map((i) => (
					<Skeleton
						key={i}
						className="h-9 w-9 rounded-full border-2 border-card"
					/>
				))}
			</div>
		</div>
	</div>
);
