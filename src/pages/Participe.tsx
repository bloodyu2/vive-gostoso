import { VerbPill } from '@/components/brand/verb-pill'
import { EventCard } from '@/components/events/event-card'
import { useEvents } from '@/hooks/useEvents'
import { usePageMeta } from '@/hooks/usePageMeta'

export default function Participe() {
  usePageMeta({
    title: 'Eventos em Gostoso',
    description: 'Festivais, eventos culturais e agenda completa de São Miguel do Gostoso.',
  })
  const { data: events = [], isLoading } = useEvents()
  return (
    <main className="max-w-6xl mx-auto px-5 md:px-8 py-12">
      <div className="mb-10">
        <VerbPill verb="participe" />
        <p className="mt-3 text-lg text-[#3D3D3D] max-w-xl leading-relaxed">
          Réveillon, festivais de kite, mostra de cinema, bossa nova na praia.<br />
          Gostoso nunca para.
        </p>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E8E4DF] animate-pulse overflow-hidden">
              <div className="aspect-[16/7] bg-[#E8E4DF]" />
              <div className="p-5 space-y-2">
                <div className="h-4 bg-[#E8E4DF] rounded w-1/3" />
                <div className="h-5 bg-[#E8E4DF] rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(e => <EventCard key={e.id} event={e} />)}
        </div>
      )}
    </main>
  )
}
