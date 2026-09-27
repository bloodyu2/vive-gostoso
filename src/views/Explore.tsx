'use client'
import { useTranslation } from 'react-i18next'
import dynamic from 'next/dynamic'
import { useBusinesses } from '@/hooks/useBusinesses'
import { ErrorState } from '@/components/ui/error-state'
import type { Business } from '@/types/database'
import type { PontoMapa } from '@/data/pontos-mapa'
import type { Idioma } from '@/data/praias-mares'
import type { TextosMapa } from '@/components/map/explore-map'

function ExploreMapLoading() {
  const { t } = useTranslation()
  return (
    <div className="w-full h-full bg-teal/10 animate-pulse flex items-center justify-center">
      <span className="text-teal font-medium">{t('common.carregando')}</span>
    </div>
  )
}

const ExploreMap = dynamic(
  () => import('@/components/map/explore-map').then((mod) => ({ default: mod.ExploreMap })),
  {
    ssr: false,
    loading: () => <ExploreMapLoading />,
  }
)

type ExploreProps = {
  initialBusinesses?: Business[]
  pontos?: PontoMapa[]
  textos?: TextosMapa
  lang?: Idioma
}

/** Mapa de /explore/mapa: negocios cadastrados e pontos da regiao. O titulo e
 *  a lista dos pontos ficam na pagina (servidor); aqui so o mapa, que roda no
 *  navegador porque o Mapbox nao roda no servidor. */
export default function Explore({ initialBusinesses = [], pontos, textos, lang }: ExploreProps) {
  const { data: businesses = initialBusinesses, isError, refetch } = useBusinesses(undefined, { initialData: initialBusinesses })
  return (
    <div role="region" aria-label={textos?.mapa_aria} className="h-[75dvh] min-h-[480px] border-y border-border-1">
      {isError ? (
        <div className="w-full h-full flex items-center justify-center">
          <ErrorState onRetry={() => refetch()} />
        </div>
      ) : (
        <ExploreMap businesses={businesses} pontos={pontos} textos={textos} lang={lang} />
      )}
    </div>
  )
}
