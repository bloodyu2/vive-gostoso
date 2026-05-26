// src/views/Contrate.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, User, Briefcase, MessageCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { useProfessionals } from '@/hooks/useProfessionals'
import { buildWhatsAppLink } from '@/lib/whatsapp'
import {
  PROFESSIONAL_CATEGORY_LABELS,
  PROFESSIONAL_CATEGORIES,
  type ProfessionalCategory,
} from '@/types/professional'
import type { Professional } from '@/types/professional'

// ── Service companies ──────────────────────────────────────────────────────
type ServiceCompany = {
  id: string
  name: string
  slug: string
  description: string | null
  whatsapp: string | null
  business_type: string
  category: { name: string } | null
}

function useServiceCompanies() {
  return useQuery<ServiceCompany[]>({
    queryKey: ['service-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gostoso_businesses')
        .select('id, name, slug, description, whatsapp, business_type, category:gostoso_categories(name)')
        .eq('business_type', 'service_company')
        .eq('is_published', true)
        .order('display_order', { ascending: true })
      if (error) throw error
      return (data ?? []) as unknown as ServiceCompany[]
    },
  })
}

// ── Job listings ─────────────────────────────────────────────────────────
type JobListing = {
  id: string
  title: string
  description: string | null
  business_name: string | null
  contract_type: string | null
  whatsapp: string | null
}

function useJobListings() {
  return useQuery<JobListing[]>({
    queryKey: ['job-listings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gostoso_job_listings')
        .select('id, title, description, business_name, contract_type, whatsapp')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as JobListing[]
    },
  })
}

// ── Avatar helpers ─────────────────────────────────────────────────────────
function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}

const AVATAR_COLORS = [
  'bg-teal', 'bg-[#C2760C]', 'bg-[#4A5568]', 'bg-[#6B46C1]',
  'bg-[#C05621]', 'bg-[#276749]',
]

function avatarColor(id: string): string {
  const sum = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  return (
    <span className="text-[#C2760C] text-xs">
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </span>
  )
}

// ── Professional card ──────────────────────────────────────────────────────
function ProfessionalCard({ pro }: { pro: Professional }) {
  const waLink = pro.whatsapp
    ? buildWhatsAppLink(pro.whatsapp, { source: 'professional_card', name: pro.display_name })
    : null

  return (
    <div className="bg-white rounded-2xl border border-[#E8E4DF] p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-white text-sm ${avatarColor(pro.id)}`}>
          {initials(pro.display_name)}
        </div>
        <div className="flex-1 min-w-0">
          <Link href={`/contrate/profissional/${pro.slug}`} className="font-semibold text-[#1A1A1A] text-sm hover:text-teal transition-colors">
            {pro.display_name}
          </Link>
          <p className="text-xs text-[#737373] leading-snug">{pro.headline}</p>
        </div>
      </div>
      {pro.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {pro.specialties.slice(0, 3).map(s => (
            <span key={s} className="bg-[#F5F2EE] text-[#555] text-[10px] font-medium px-2 py-0.5 rounded-md">
              {s}
            </span>
          ))}
        </div>
      )}
      {pro.review_count > 0 && (
        <div className="flex items-center gap-1.5 mb-3 text-xs text-[#737373]">
          <Stars rating={pro.rating_avg} />
          {pro.rating_avg.toFixed(1)} · {pro.review_count} avaliações
        </div>
      )}
      {waLink ? (
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 w-full bg-teal text-white rounded-xl py-2 text-xs font-semibold hover:bg-teal/90 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Chamar no WhatsApp
        </a>
      ) : (
        <Link
          href={`/contrate/profissional/${pro.slug}`}
          className="flex items-center justify-center w-full border border-[#E8E4DF] text-[#737373] rounded-xl py-2 text-xs font-semibold hover:bg-[#F5F2EE] transition-colors"
        >
          Ver perfil
        </Link>
      )}
    </div>
  )
}

// ── Service company card ───────────────────────────────────────────────────
function ServiceCompanyCard({ company }: { company: ServiceCompany }) {
  const waLink = company.whatsapp
    ? buildWhatsAppLink(company.whatsapp, { source: 'service_company_card', name: company.name })
    : null

  return (
    <div className="bg-white rounded-2xl border border-[#E8E4DF] p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-[#1A1A1A] flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <Link href={`/negocio/${company.slug}`} className="font-semibold text-[#1A1A1A] text-sm hover:text-teal transition-colors">
            {company.name}
          </Link>
          {company.category?.name && (
            <span className="text-[10px] font-semibold text-teal bg-teal/10 px-2 py-0.5 rounded-full ml-1">
              {company.category.name}
            </span>
          )}
        </div>
      </div>
      {company.description && (
        <p className="text-xs text-[#737373] leading-relaxed mb-3 line-clamp-2">
          {company.description}
        </p>
      )}
      <span className="text-[10px] font-semibold text-[#737373] bg-[#F5F2EE] px-2 py-0.5 rounded-full">
        Empresa de Serviço
      </span>
      {waLink && (
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 w-full bg-[#1A1A1A] text-white rounded-xl py-2 text-xs font-semibold hover:bg-[#333] transition-colors mt-3"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Pedir orçamento
        </a>
      )}
    </div>
  )
}

// ── Loading spinner ────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function Contrate() {
  type Tab = 'empresas' | 'profissionais' | 'vagas'
  const [activeTab, setActiveTab] = useState<Tab>('profissionais')
  const [categoryFilter, setCategoryFilter] = useState<ProfessionalCategory | 'all'>('all')

  const { data: professionals = [], isLoading: prosLoading } = useProfessionals(categoryFilter)
  const { data: companies = [], isLoading: companiesLoading } = useServiceCompanies()
  const { data: jobs = [], isLoading: jobsLoading } = useJobListings()

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Hero */}
      <section className="bg-[#1A1A1A]">
        <div className="max-w-5xl mx-auto px-5 md:px-8 pt-12 pb-0">
          <div className="inline-flex items-center gap-2 bg-teal/20 text-teal text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            🤝 Contrate
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight mb-2">
            Profissionais e empresas<br className="hidden md:block" /> de São Miguel do Gostoso
          </h1>
          <p className="text-[#888] text-sm mb-8 max-w-lg">
            Encontre quem você precisa — autônomos, agências e serviços da cidade.
          </p>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-[#333]">
            {[
              { id: 'profissionais' as Tab, label: 'Profissionais', icon: <User className="w-3.5 h-3.5" />, count: professionals.length },
              { id: 'empresas' as Tab, label: 'Empresas', icon: <Building2 className="w-3.5 h-3.5" />, count: companies.length },
              { id: 'vagas' as Tab, label: 'Vagas', icon: <Briefcase className="w-3.5 h-3.5" />, count: jobs.length },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                  activeTab === tab.id
                    ? 'border-teal text-teal'
                    : 'border-transparent text-[#888] hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-teal/20 text-teal' : 'bg-[#333] text-[#888]'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-5xl mx-auto px-5 md:px-8 py-8">

        {/* ── Profissionais ── */}
        {activeTab === 'profissionais' && (
          <>
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  categoryFilter === 'all'
                    ? 'bg-teal text-white'
                    : 'bg-white border border-[#E8E4DF] text-[#555] hover:bg-[#F5F2EE]'
                }`}
              >
                Todos
              </button>
              {PROFESSIONAL_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    categoryFilter === cat
                      ? 'bg-teal text-white'
                      : 'bg-white border border-[#E8E4DF] text-[#555] hover:bg-[#F5F2EE]'
                  }`}
                >
                  {PROFESSIONAL_CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            {prosLoading ? <Spinner /> : professionals.length === 0 ? (
              <div className="text-center py-16">
                <User className="w-10 h-10 text-[#E8E4DF] mx-auto mb-3" />
                <p className="text-sm text-[#737373]">Nenhum profissional encontrado nessa categoria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {professionals.map(pro => <ProfessionalCard key={pro.id} pro={pro} />)}
              </div>
            )}
          </>
        )}

        {/* ── Empresas ── */}
        {activeTab === 'empresas' && (
          companiesLoading ? <Spinner /> : companies.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="w-10 h-10 text-[#E8E4DF] mx-auto mb-3" />
              <p className="text-sm text-[#737373]">Nenhuma empresa de serviço cadastrada ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {companies.map(c => <ServiceCompanyCard key={c.id} company={c} />)}
            </div>
          )
        )}

        {/* ── Vagas ── */}
        {activeTab === 'vagas' && (
          jobsLoading ? <Spinner /> : jobs.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="w-10 h-10 text-[#E8E4DF] mx-auto mb-3" />
              <p className="text-sm text-[#737373]">Nenhuma vaga publicada no momento.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map(job => (
                <div key={job.id} className="bg-white rounded-2xl border border-[#E8E4DF] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#1A1A1A] text-sm mb-0.5">{job.title}</p>
                      {job.business_name && <p className="text-xs text-[#737373]">{job.business_name}</p>}
                    </div>
                    {job.contract_type && (
                      <span className="text-[10px] font-semibold bg-[#F5F2EE] text-[#555] px-2 py-1 rounded-full flex-shrink-0">
                        {job.contract_type}
                      </span>
                    )}
                  </div>
                  {job.description && (
                    <p className="text-xs text-[#737373] mt-2 leading-relaxed line-clamp-2">
                      {job.description}
                    </p>
                  )}
                  {job.whatsapp && (
                    <a
                      href={buildWhatsAppLink(job.whatsapp, `Olá! Vi a vaga "${job.title}" no Vive Gostoso e tenho interesse.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 bg-teal text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-teal/90 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Candidatar pelo WhatsApp
                    </a>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* CTA */}
        <div className="mt-12 bg-[#1A1A1A] rounded-3xl px-8 py-10 text-center">
          <p className="text-white font-display text-xl font-bold mb-2">
            Você é profissional ou tem uma empresa de serviço?
          </p>
          <p className="text-[#888] text-sm mb-6 max-w-sm mx-auto">
            Crie seu perfil gratuitamente e apareça aqui para toda a cidade.
          </p>
          <Link
            href="/cadastre"
            className="inline-flex items-center gap-2 bg-teal text-white px-7 py-3.5 rounded-2xl font-semibold text-sm hover:bg-teal/90 transition-colors"
          >
            Criar meu perfil grátis
          </Link>
        </div>
      </section>
    </div>
  )
}
