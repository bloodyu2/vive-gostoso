import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePageMeta } from '@/hooks/usePageMeta'
import { Briefcase, Wrench, Plus } from 'lucide-react'
import { ServiceCard } from '@/components/contrate/service-card'
import { JobCard } from '@/components/contrate/job-card'
import { ServiceForm } from '@/components/contrate/service-form'
import { JobForm } from '@/components/contrate/job-form'
import { useServices } from '@/hooks/useServices'
import { useJobs } from '@/hooks/useJobs'
import { SERVICE_CATEGORY_LABELS } from '@/types/database'
import type { ServiceCategory } from '@/types/database'

type Tab = 'servicos' | 'vagas'

const SERVICE_CATS = Object.entries(SERVICE_CATEGORY_LABELS) as [ServiceCategory, string][]

export default function Contrate() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('servicos')

  usePageMeta({
    title: 'Contrate — Vive Gostoso',
    description: 'Encontre serviços locais e vagas de emprego em São Miguel do Gostoso. Contrate profissionais ou anuncie sua empresa no Vive Gostoso.',
    url: 'https://vivegostoso.com.br/contrate',
  })
  const [catFilter, setCatFilter] = useState<ServiceCategory | undefined>()
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [showJobForm, setShowJobForm] = useState(false)

  const { data: services = [], isLoading: loadingServices } = useServices(catFilter)
  const { data: jobs = [], isLoading: loadingJobs } = useJobs()

  return (
    <>
      <main className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white text-xs font-bold px-3 py-1.5 rounded-full mb-3 tracking-wide">
              {t('contrate.badge')}
            </div>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-[#1A1A1A] leading-tight">
              {t('contrate.titulo')}
            </h1>
            <p className="mt-2 text-[#737373] text-base max-w-lg leading-relaxed">
              {t('contrate.desc')}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setShowServiceForm(true)}
              className="flex items-center gap-2 bg-teal text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('contrate.oferecer_servico')}</span>
              <span className="sm:hidden">{t('contrate.servico')}</span>
            </button>
            <button
              onClick={() => setShowJobForm(true)}
              className="flex items-center gap-2 bg-ocre text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('contrate.publicar_vaga')}</span>
              <span className="sm:hidden">{t('contrate.vaga')}</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E8E4DF] mb-6 gap-1">
          <button
            onClick={() => { setTab('servicos'); setCatFilter(undefined) }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
              tab === 'servicos'
                ? 'border-teal text-teal'
                : 'border-transparent text-[#737373] hover:text-[#1A1A1A]'
            }`}
          >
            <Wrench className="w-4 h-4" />
            {t('contrate.tab_servicos')}
            {services.length > 0 && tab === 'servicos' && (
              <span className="bg-teal/10 text-teal text-xs px-2 py-0.5 rounded-full">{services.length}</span>
            )}
          </button>
          <button
            onClick={() => { setTab('vagas'); setCatFilter(undefined) }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
              tab === 'vagas'
                ? 'border-ocre text-ocre'
                : 'border-transparent text-[#737373] hover:text-[#1A1A1A]'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            {t('contrate.tab_vagas')}
            {jobs.length > 0 && tab === 'vagas' && (
              <span className="bg-ocre/10 text-ocre text-xs px-2 py-0.5 rounded-full">{jobs.length}</span>
            )}
          </button>
        </div>

        {/* Serviços tab */}
        {tab === 'servicos' && (
          <>
            {/* Category filter pills — horizontal scroll on mobile */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
              <button
                onClick={() => setCatFilter(undefined)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !catFilter ? 'bg-teal text-white' : 'bg-white border border-[#E8E4DF] text-[#737373] hover:border-teal/40'
                }`}
              >
                {t('contrate.todos')}
              </button>
              {SERVICE_CATS.map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setCatFilter(catFilter === k ? undefined : k)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    catFilter === k ? 'bg-teal text-white' : 'bg-white border border-[#E8E4DF] text-[#737373] hover:border-teal/40'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            {loadingServices ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-[#E8E4DF] overflow-hidden animate-pulse">
                    <div className="aspect-[4/3] bg-[#E8E4DF]" />
                    <div className="p-5 space-y-2">
                      <div className="h-4 bg-[#E8E4DF] rounded w-2/3" />
                      <div className="h-3 bg-[#E8E4DF] rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">🔨</div>
                <h3 className="font-display font-bold text-xl mb-2">{t('contrate.sem_servicos')}</h3>
                <p className="text-[#737373] text-sm max-w-xs mx-auto leading-relaxed mb-5">
                  {t('contrate.sem_servicos_sub')}
                </p>
                <button
                  onClick={() => setShowServiceForm(true)}
                  className="bg-teal text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-teal-dark transition-colors"
                >
                  {t('contrate.cadastrar_servico')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {services.map(s => <ServiceCard key={s.id} service={s} />)}
              </div>
            )}
          </>
        )}

        {/* Vagas tab */}
        {tab === 'vagas' && (
          <>
            {loadingJobs ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-[#E8E4DF] p-5 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-[#E8E4DF] rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-[#E8E4DF] rounded w-1/3" />
                        <div className="h-3 bg-[#E8E4DF] rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">💼</div>
                <h3 className="font-display font-bold text-xl mb-2">{t('contrate.sem_vagas')}</h3>
                <p className="text-[#737373] text-sm max-w-xs mx-auto leading-relaxed mb-5">
                  {t('contrate.sem_vagas_sub')}
                </p>
                <button
                  onClick={() => setShowJobForm(true)}
                  className="bg-ocre text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  {t('contrate.publicar_vaga')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                {jobs.map(j => <JobCard key={j.id} job={j} />)}
              </div>
            )}
          </>
        )}
      </main>

      {showServiceForm && <ServiceForm onClose={() => setShowServiceForm(false)} />}
      {showJobForm && <JobForm onClose={() => setShowJobForm(false)} />}
    </>
  )
}
