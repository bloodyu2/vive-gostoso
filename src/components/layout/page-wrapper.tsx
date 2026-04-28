import { Header } from './header'
import { Footer } from './footer'

export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-areia dark:bg-[#111111]">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
