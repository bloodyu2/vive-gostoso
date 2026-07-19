// src/components/ui/admin-list-skeleton.tsx
// Shared loading skeleton for admin list views (AdminJobs, AdminServices,
// AdminTransfers, ...). Replaces the identical hand-rolled
// `{[1,2,3].map(i => <div className="h-2X bg-[#E8E4DF] rounded-2xl animate-pulse" />)}`
// block that used to be duplicated in each view.
interface AdminListSkeletonProps {
  /** Number of skeleton rows to render. Defaults to 3. */
  rows?: number
  /** Tailwind height class for each row, e.g. 'h-24'. Defaults to 'h-24'. */
  height?: string
}

export function AdminListSkeleton({ rows = 3, height = 'h-24' }: AdminListSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`${height} bg-[#E8E4DF] rounded-2xl animate-pulse`} />
      ))}
    </div>
  )
}
