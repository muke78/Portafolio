import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading states for the About tabs. They mirror the final cards (same
 * border, radius, padding and image height) so nothing shifts when the
 * real data arrives, and replace the old centered spinner.
 */
interface SkeletonProps {
	label: string;
}

const Status = ({
	label,
	children,
	className,
}: SkeletonProps & { children: React.ReactNode; className: string }) => (
	<output aria-busy="true" className={className}>
		<span className="sr-only">{label}</span>
		{children}
	</output>
);

export const SkeletonEducation = ({ label }: SkeletonProps) => (
	<Status label={label} className="flex flex-col gap-4">
		{[0, 1].map((i) => (
			<div
				key={i}
				className="grid grid-cols-1 w-full overflow-hidden rounded-xl border border-border bg-card"
			>
				<Skeleton className="h-[160px] w-full rounded-none sm:h-[220px]" />
				<div className="flex flex-col gap-3 p-5">
					<div className="flex items-center justify-between gap-4">
						<Skeleton className="h-7 w-2/5" />
						<Skeleton className="h-8 w-28 rounded-full" />
					</div>
					<Skeleton className="h-5 w-1/3" />
					<Skeleton className="mt-2 h-4 w-full" />
					<Skeleton className="h-4 w-11/12" />
					<Skeleton className="h-4 w-2/3" />
				</div>
			</div>
		))}
	</Status>
);

export const SkeletonExperience = ({ label }: SkeletonProps) => (
	<Status label={label} className="grid grid-cols-1 gap-5 xl:grid-cols-2">
		{[0, 1, 2, 3].map((i) => (
			<div
				key={i}
				className="flex flex-col rounded-2xl border border-border bg-card p-7"
			>
				<div className="flex items-center gap-3">
					<Skeleton className="h-10 w-10 shrink-0 rounded-full" />
					<Skeleton className="h-5 w-40" />
					<Skeleton className="h-5 w-20 rounded-full" />
				</div>
				<Skeleton className="mt-6 h-8 w-4/5" />
				<Skeleton className="mt-2 h-5 w-2/5" />
				<div className="mt-6 flex flex-col gap-2 border-t border-border pt-5">
					<Skeleton className="h-4 w-1/2" />
					<Skeleton className="h-4 w-2/3" />
				</div>
			</div>
		))}
	</Status>
);

export const SkeletonAboutMe = ({ label }: SkeletonProps) => (
	<Status
		label={label}
		className="grid grid-cols-1 w-full overflow-hidden rounded-xl border border-border bg-card"
	>
		<Skeleton className="h-[220px] w-full rounded-none sm:h-[400px]" />
		<div className="flex flex-col gap-3 p-5">
			<div className="flex items-center justify-between gap-4">
				<Skeleton className="h-8 w-1/3" />
				<Skeleton className="h-8 w-32 rounded-full" />
			</div>
			<Skeleton className="h-5 w-1/4" />
			<Skeleton className="mt-2 h-4 w-full" />
			<Skeleton className="h-4 w-full" />
			<Skeleton className="h-4 w-4/5" />
		</div>
	</Status>
);

/** Pill row shown while a tabbed section waits for client hydration. */
export const SkeletonTabsRow = ({
	count,
	label,
}: SkeletonProps & { count: number }) => (
	<output aria-busy="true" className="flex flex-wrap gap-4">
		<span className="sr-only">{label}</span>
		{Array.from({ length: count }, (_, i) => (
			<Skeleton
				// biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list
				key={i}
				className="h-11 w-28 rounded-full lg:w-36"
			/>
		))}
	</output>
);
