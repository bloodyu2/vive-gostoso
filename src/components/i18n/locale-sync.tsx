'use client'
// This component was specific to the Vite/React Router setup.
// In Next.js, locale routing is handled by next-intl middleware and the app/ directory.
// Kept as a no-op export so any remaining references don't cause compile errors.

export function LocaleSync({ children }: { children?: React.ReactNode; lang?: string }) {
  return <>{children}</>
}
