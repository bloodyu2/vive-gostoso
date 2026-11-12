'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'
import {
  Store, LayoutDashboard,
  LogOut, User,
} from 'lucide-react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useMyBusinesses } from '@/hooks/useMyBusinesses'
import { useMyProfessional } from '@/hooks/useProfessionals'
import { ABAS, abaDaUrl, queryDaAba, type AbaId } from '@/lib/clube/painel-abas'
import { BarraDeAbas, PainelDaAba, type DefinicaoDeAba } from './painel-abas/BarraDeAbas'
import { useTrocarUrlDoPainel } from './painel-abas/use-url-do-painel'
import { ResumoAba } from './painel-abas/ResumoAba'
import { PerfilAba } from './painel-abas/PerfilAba'
import { PassaporteAba } from './painel-abas/PassaporteAba'
import { ContatosAba } from './painel-abas/ContatosAba'
import { PlaquinhaAba } from './painel-abas/PlaquinhaAba'

export default function Painel() {
  return <AuthGuard><PainelInner /></AuthGuard>
}

function UserAvatar({ email }: { email: string }) {
  const initials = email.slice(0, 2).toUpperCase()
  return (
    <div className="w-9 h-9 rounded-full bg-teal/15 text-teal flex items-center justify-center text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  )
}

function TypeFork() {
  const router = useRouter()
  const { t } = useTranslation('painel')
  const lp = useLocalePath()
  const businessTags = t('typefork.business_tags').split('|')
  const professionalTags = t('typefork.professional_tags').split('|')
  return (
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center px-5">
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-3xl border border-[#E8E4DF] overflow-hidden shadow-sm">
          <div className="bg-[#1A1A1A] px-8 py-6">
            <h2 className="font-display text-xl font-bold text-white mb-1">
              {t('typefork.title')}
            </h2>
            <p className="text-[#888] text-sm">
              {t('typefork.subtitle')}
            </p>
          </div>
          <div className="p-6">
            <p className="text-xs font-semibold text-fg-3-texto uppercase tracking-wide mb-4">
              {t('typefork.select_prompt')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => router.push(lp('/cadastre/perfil'))}
                className="text-left border-2 border-[#E8E4DF] rounded-2xl p-5 hover:border-teal hover:bg-teal/5 transition-all"
              >
                <Store className="w-8 h-8 text-teal mb-3" />
                <p className="font-semibold text-[#1A1A1A] text-sm mb-1">
                  {t('typefork.business_title')}
                </p>
                <p className="text-xs text-fg-3-texto leading-relaxed">
                  {t('typefork.business_desc')}
                </p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {businessTags.map(tag => (
                    <span key={tag} className="bg-[#F5F2EE] text-[#888] text-[10px] px-2 py-0.5 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
              <button
                type="button"
                onClick={() => router.push(lp('/cadastre/profissional'))}
                className="text-left border-2 border-[#E8E4DF] rounded-2xl p-5 hover:border-teal hover:bg-teal/5 transition-all"
              >
                <User className="w-8 h-8 text-teal mb-3" />
                <p className="font-semibold text-[#1A1A1A] text-sm mb-1">
                  {t('typefork.professional_title')}
                </p>
                <p className="text-xs text-fg-3-texto leading-relaxed">
                  {t('typefork.professional_desc')}
                </p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {professionalTags.map(tag => (
                    <span key={tag} className="bg-[#F5F2EE] text-[#888] text-[10px] px-2 py-0.5 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PainelInner() {
  const { user, supabase } = useAuth()
  const { data: profile, isLoading: profileLoading } = useProfile()
  const role = profile?.role ?? null
  const { data: businesses = [], isLoading: businessesLoading } = useMyBusinesses()
  const { data: myProfessional, isLoading: profLoading } = useMyProfessional()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation('painel')
  const lp = useLocalePath()

  /* Abas: a aba e o negocio escolhido moram na URL (?aba=contatos&bizId=...), entao o link
     abre no lugar certo e o botao de recarregar nao perde onde a pessoa estava. */
  const trocarUrl = useTrocarUrlDoPainel()
  const abaParam = searchParams?.get('aba') ?? null
  const bizParam = searchParams?.get('bizId') ?? null
  const novoNegocio = searchParams?.get('new') === '1'
  // #contatos, #passaporte...: o endereco curto das rotas antigas. O hash so existe no navegador,
  // por isso entra por efeito e nao no primeiro render (senao servidor e navegador discordam).
  const [hash, setHash] = useState<string | null>(null)
  useEffect(() => {
    const ler = () => setHash(window.location.hash || null)
    ler()
    window.addEventListener('hashchange', ler)
    return () => window.removeEventListener('hashchange', ler)
  }, [])
  const temNegocio = businesses.length > 0
  const aba: AbaId = temNegocio ? abaDaUrl(abaParam, hash) : 'resumo'
  const negocio = businesses.find((b) => b.id === bizParam) ?? businesses[0] ?? null
  const [visitadas, setVisitadas] = useState<ReadonlySet<AbaId>>(() => new Set<AbaId>())
  if (!visitadas.has(aba)) setVisitadas(new Set(visitadas).add(aba))

  // Must be AFTER all hook calls
  if (profileLoading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (role === 'admin') { router.replace(lp('/cadastre/admin')); return null }

  // If no businesses and no professional profile, show the fork
  if (!profileLoading && !businessesLoading && !profLoading && businesses.length === 0 && !myProfessional) {
    return <TypeFork />
  }

  // Sem esperar os negocios o Resumo piscava "Nenhum negocio ainda" antes de a lista chegar.
  if (businessesLoading || profLoading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const abasDef: DefinicaoDeAba[] = ABAS.map((id) => ({ id, rotulo: t('abas.' + id) }))

  function irParaAba(id: AbaId) {
    trocarUrl((p) => new URLSearchParams(queryDaAba(p, id)))
  }

  function escolherNegocio(id: string) {
    trocarUrl((p) => {
      p.set('bizId', id)
      return p
    })
  }

  function fecharNovo() {
    trocarUrl((p) => {
      p.delete('new')
      return p
    })
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <header className="bg-white border-b border-[#E8E4DF] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-4 h-4 text-fg-3-texto" />
            <span className="text-sm font-semibold text-[#1A1A1A]">{t('header_title')}</span>
          </div>
          <div className="flex items-center gap-3">
            {user?.email && (
              <div className="hidden sm:flex items-center gap-2">
                <UserAvatar email={user.email} />
                <span className="text-xs text-fg-3-texto truncate max-w-[180px]">{user.email}</span>
              </div>
            )}
            <button
              onClick={() => supabase.auth.signOut()}
              title={t('sair')}
              className="flex items-center gap-1.5 text-xs text-fg-3-texto hover:text-[#1A1A1A] border border-[#E8E4DF] hover:border-[#C4BFBA] rounded-xl px-3 py-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t('sair')}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 md:px-8 py-8">

        <div className="mb-6">
          <h1 className="font-display text-2xl font-semibold text-[#1A1A1A]">{t('greeting')}</h1>
          <p className="text-sm text-fg-3-texto mt-1">{t('greeting_sub')}</p>
        </div>

        {temNegocio && negocio && businesses.length > 1 && (
          <div className="mb-4 max-w-sm">
            <label htmlFor="painel-negocio" className="block text-xs font-semibold text-fg-3-texto mb-1">
              {t('abas.negocio_campo')}
            </label>
            <select
              id="painel-negocio"
              value={negocio.id}
              onChange={(e) => escolherNegocio(e.target.value)}
              className="w-full min-h-11 rounded-xl border border-[#E8E4DF] bg-white px-3 text-sm text-[#1A1A1A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {temNegocio && (
          <BarraDeAbas abas={abasDef} ativa={aba} onChange={irParaAba} rotuloDoGrupo={t('abas.nav_label')} />
        )}

        <PainelDaAba id="resumo" ativa={aba} visitada={visitadas.has('resumo')} semAbas={!temNegocio}>
          <ResumoAba
            negocios={businesses}
            negocio={negocio}
            profissional={myProfessional ?? null}
            novoNegocio={novoNegocio}
            onFecharNovo={fecharNovo}
            onAba={irParaAba}
            onEscolher={escolherNegocio}
          >
          </ResumoAba>
        </PainelDaAba>

        {temNegocio && negocio && (
          <>
            <PainelDaAba id="perfil" ativa={aba} visitada={visitadas.has('perfil')}>
              <PerfilAba key={negocio.id} negocio={negocio} />
            </PainelDaAba>
            <PainelDaAba id="passaporte" ativa={aba} visitada={visitadas.has('passaporte')}>
              <PassaporteAba key={negocio.id} negocio={negocio} />
            </PainelDaAba>
            <PainelDaAba id="contatos" ativa={aba} visitada={visitadas.has('contatos')}>
              <ContatosAba key={negocio.id} negocio={negocio} onAba={irParaAba} />
            </PainelDaAba>
            <PainelDaAba id="plaquinha" ativa={aba} visitada={visitadas.has('plaquinha')}>
              <PlaquinhaAba key={negocio.id} negocio={negocio} />
            </PainelDaAba>
          </>
        )}

        <div className="mt-12 pt-6 border-t border-[#E8E4DF] text-center">
          <p className="text-xs text-[#C4BFBA]">
            {t('footer_help')}{' '}
            <a href="https://www.instagram.com/vivegostoso" target="_blank" rel="noopener noreferrer" className="text-teal hover:underline">
              @vivegostoso
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
