'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { AuthGuard } from '@/components/auth/auth-guard'
import { useLocalePath } from '@/hooks/useLocalePath'
import { useMyBusinesses, type BusinessSummary } from '@/hooks/useMyBusinesses'
import { supabase } from '@/lib/supabase'

/* Area do parceiro do Passaporte Gostoso. O dono muda a propria vantagem (texto,
   regra, limite por mes, validade), liga e pausa, e acompanha usos. Tudo vale na
   hora, sem aprovacao. A escrita passa pela RLS de gostoso_club_partners: o dono so
   mexe no proprio negocio, e nunca coloca a vantagem em "em combinacao". */

interface Parceiro {
  id: string
  business_id: string
  beneficio: string
  regra: string | null
  limite_mensal: number | null
  valido_ate: string | null
  status: 'em_combinacao' | 'no_ar' | 'pausado'
}

interface PainelDados {
  codigo_hoje: string
  usos_mes: number
  vistas_mes: number
  dias_de_pico: number[]
  usos: { criado_em: string; codigo: string }[]
}

export default function Passaporte() {
  return (
    <AuthGuard>
      <PassaporteInner />
    </AuthGuard>
  )
}

function PassaporteInner() {
  const { t } = useTranslation('passaporte')
  const lp = useLocalePath()
  const { data: negocios = [], isPending } = useMyBusinesses()
  const [escolhido, setEscolhido] = useState<string | null>(null)
  const negocio = negocios.find((n) => n.id === escolhido) ?? negocios[0] ?? null

  return (
    <div>
      <header className="clube-topo-painel">
        <div className="clube-col">
          <div className="clube-marca-linha">
            <Link className="clube-marca" href={lp('/cadastre/painel')}>
              {t('voltar')}
            </Link>
            <span className="clube-selo">{t('header')}</span>
          </div>
          <h1 className="clube-h1" style={{ fontSize: '2.75rem', marginTop: '1.5rem' }}>
            {t('titulo')}
          </h1>
          <p className="clube-intro-painel">{t('sub')}</p>
        </div>
      </header>

      <main className="clube-col" style={{ paddingBlock: '1.5rem 3rem' }}>
        {isPending ? (
          <p className="clube-aviso">{t('carregando')}</p>
        ) : !negocio ? (
          <p className="clube-aviso">{t('sem_negocio')}</p>
        ) : (
          <>
            {negocios.length > 1 ? (
              <label style={{ display: 'block', marginBottom: '1.25rem' }}>
                <span className="clube-tipo">{t('campo_negocio')}</span>
                <select
                  className="clube-campo"
                  value={negocio.id}
                  onChange={(e) => setEscolhido(e.target.value)}
                  style={{ marginTop: '0.375rem' }}
                >
                  {negocios.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <p className="clube-nome" style={{ marginBottom: '1.25rem' }}>
                {negocio.name}
              </p>
            )}
            <AreaDoNegocio key={negocio.id} negocio={negocio} />
          </>
        )}
      </main>
    </div>
  )
}

function AreaDoNegocio({ negocio }: { negocio: BusinessSummary }) {
  const { t } = useTranslation('passaporte')
  const lp = useLocalePath()

  const parceiro = useQuery<Parceiro | null>({
    queryKey: ['clube-parceiro', negocio.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gostoso_club_partners')
        .select('id, business_id, beneficio, regra, limite_mensal, valido_ate, status')
        .eq('business_id', negocio.id)
        .maybeSingle()
      if (error) throw error
      return (data as Parceiro | null) ?? null
    },
  })

  if (parceiro.isLoading) return <p className="clube-aviso">{t('carregando')}</p>
  if (parceiro.isError) return <p className="clube-erro">{t('erro_carregar')}</p>

  return (
    <>
      {!negocio.is_published || !negocio.active ? <p className="clube-aviso">{t('nao_publicado')}</p> : null}
      {parceiro.data ? <Numeros parceiro={parceiro.data} /> : null}
      <FormVantagem
        key={parceiro.data?.id ?? 'novo'}
        negocioId={negocio.id}
        parceiro={parceiro.data ?? null}
      />
      <p className="clube-nota">{t('nota')}</p>
      <p className="clube-nota">
        <Link href={lp('/clube')} style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>
          {t('ver_pagina')}
        </Link>
      </p>
    </>
  )
}

/** Hoje no fuso de Gostoso, no formato do campo de data (AAAA-MM-DD). */
function hojeEmGostoso(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Fortaleza' }).format(new Date())
}

function FormVantagem({ negocioId, parceiro }: { negocioId: string; parceiro: Parceiro | null }) {
  const { t } = useTranslation('passaporte')
  const qc = useQueryClient()
  const [beneficio, setBeneficio] = useState(parceiro?.beneficio ?? '')
  const [regra, setRegra] = useState(parceiro?.regra ?? '')
  const [semLimite, setSemLimite] = useState(parceiro?.limite_mensal == null)
  const [limite, setLimite] = useState(parceiro?.limite_mensal ? String(parceiro.limite_mensal) : '')
  const [semData, setSemData] = useState(!parceiro?.valido_ate)
  const [validade, setValidade] = useState(parceiro?.valido_ate ?? '')
  const [estado, setEstado] = useState<'ocioso' | 'salvando' | 'salvo' | 'erro' | 'erro_limite' | 'erro_data'>('ocioso')

  const status = parceiro?.status ?? null
  const ligada = status === 'no_ar'
  const emCombinacao = status === 'em_combinacao'
  const valido = beneficio.trim().length >= 3 && beneficio.trim().length <= 140

  async function gravar(novoStatus: 'no_ar' | 'pausado') {
    if (!valido) return
    const limiteNumero = Number(limite)
    if (!semLimite && (!Number.isInteger(limiteNumero) || limiteNumero < 1 || limiteNumero > 100000)) {
      setEstado('erro_limite')
      return
    }
    if (!semData && (!validade || validade < hojeEmGostoso())) {
      setEstado('erro_data')
      return
    }
    setEstado('salvando')
    const campos = {
      beneficio: beneficio.trim(),
      regra: regra.trim() || null,
      limite_mensal: semLimite ? null : limiteNumero,
      valido_ate: semData || !validade ? null : validade,
      status: novoStatus,
    }
    const { error } = parceiro
      ? await supabase.from('gostoso_club_partners').update(campos).eq('id', parceiro.id)
      : await supabase.from('gostoso_club_partners').insert({ ...campos, business_id: negocioId })
    if (error) {
      setEstado('erro')
      return
    }
    setEstado('salvo')
    await qc.invalidateQueries({ queryKey: ['clube-parceiro', negocioId] })
    await qc.invalidateQueries({ queryKey: ['clube-painel'] })
  }

  return (
    <section className="clube-card" aria-labelledby="minha-vantagem" style={{ marginTop: '1.25rem', padding: '1.25rem' }}>
      {!parceiro ? (
        <>
          <h2 id="minha-vantagem" className="clube-nome">
            {t('entrar_titulo')}
          </h2>
          <p className="clube-regra">{t('entrar_texto')}</p>
        </>
      ) : (
        <div className="clube-card-topo">
          <h2 id="minha-vantagem" className="clube-nome">
            {t('titulo')}
          </h2>
          <span className={`clube-tag ${ligada ? 'clube-tag--no-ar' : 'clube-tag--combinacao'}`}>
            {ligada ? t('ligada') : emCombinacao ? t('em_combinacao') : t('pausada')}
          </span>
        </div>
      )}
      {emCombinacao ? <p className="clube-aviso">{t('aviso_combinacao')}</p> : null}

      <div style={{ display: 'grid', gap: '1rem', marginTop: '1.25rem' }}>
        <label>
          <span className="clube-tipo">{t('campo_beneficio')}</span>
          <textarea
            className="clube-campo"
            rows={3}
            maxLength={140}
            value={beneficio}
            onChange={(e) => setBeneficio(e.target.value)}
            style={{ marginTop: '0.375rem', resize: 'vertical' }}
          />
          <span className="clube-regra" style={{ display: 'block' }}>
            {t('ajuda_beneficio')}
          </span>
        </label>

        <label>
          <span className="clube-tipo">{t('campo_regra')}</span>
          <input
            className="clube-campo"
            type="text"
            maxLength={200}
            value={regra}
            onChange={(e) => setRegra(e.target.value)}
            style={{ marginTop: '0.375rem' }}
          />
          <span className="clube-regra" style={{ display: 'block' }}>
            {t('ajuda_regra')}
          </span>
        </label>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="clube-tipo">{t('campo_limite')}</legend>
          <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', minHeight: '2.75rem' }}>
            <input type="checkbox" checked={semLimite} onChange={(e) => setSemLimite(e.target.checked)} />
            {t('sem_limite')}
          </label>
          {!semLimite ? (
            <input
              className="clube-campo"
              type="number"
              inputMode="numeric"
              min={1}
              max={100000}
              value={limite}
              onChange={(e) => setLimite(e.target.value)}
              aria-label={t('campo_limite')}
            />
          ) : null}
        </fieldset>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="clube-tipo">{t('campo_validade')}</legend>
          <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', minHeight: '2.75rem' }}>
            <input type="checkbox" checked={semData} onChange={(e) => setSemData(e.target.checked)} />
            {t('sem_data')}
          </label>
          {!semData ? (
            <input
              className="clube-campo"
              type="date"
              value={validade}
              onChange={(e) => setValidade(e.target.value)}
              aria-label={t('campo_validade')}
            />
          ) : null}
        </fieldset>
      </div>

      <div className="clube-acoes">
        {emCombinacao || !parceiro ? (
          <>
            <button
              type="button"
              className="clube-btn clube-btn--verde"
              disabled={!valido || estado === 'salvando'}
              onClick={() => gravar('no_ar')}
            >
              {estado === 'salvando' ? t('salvando') : parceiro ? t('salvar_ligar') : t('entrar_botao')}
            </button>
            <button
              type="button"
              className="clube-btn clube-btn--contorno"
              disabled={!valido || estado === 'salvando'}
              onClick={() => gravar('pausado')}
            >
              {t('salvar_pausada')}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="clube-btn clube-btn--verde"
              disabled={!valido || estado === 'salvando'}
              onClick={() => gravar(ligada ? 'no_ar' : 'pausado')}
            >
              {estado === 'salvando' ? t('salvando') : t('salvar')}
            </button>
            <button
              type="button"
              className="clube-btn clube-btn--contorno"
              disabled={!valido || estado === 'salvando'}
              onClick={() => gravar(ligada ? 'pausado' : 'no_ar')}
            >
              {ligada ? t('pausar') : t('ligar')}
            </button>
          </>
        )}
      </div>

      <p role="status" className={estado.startsWith('erro') ? 'clube-erro' : 'clube-regra'}>
        {estado === 'salvo'
          ? t('salvo')
          : estado === 'erro'
            ? t('erro')
            : estado === 'erro_limite'
              ? t('erro_limite')
              : estado === 'erro_data'
                ? t('erro_data')
                : ''}
      </p>
    </section>
  )
}

function Numeros({ parceiro }: { parceiro: Parceiro }) {
  const { t } = useTranslation('passaporte')
  const painel = useQuery<PainelDados | null>({
    queryKey: ['clube-painel', parceiro.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('gostoso_club_painel', { p_partner: parceiro.id })
      if (error) throw error
      return (data as PainelDados | null) ?? null
    },
  })
  const dados = painel.data
  const dias = t('dias').split('|')
  const pico =
    dados && dados.dias_de_pico.length > 0 ? dados.dias_de_pico.map((d) => dias[d]).join(', ') : t('pico_vazio')

  if (painel.isLoading || !dados) return null

  const quando = (iso: string) =>
    new Intl.DateTimeFormat(undefined, {
      timeZone: 'America/Fortaleza',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))

  return (
    <section aria-labelledby="neste-mes">
      <h2 id="neste-mes" className="clube-h2" style={{ fontSize: '1.25rem' }}>
        {t('numeros_titulo')}
      </h2>
      <dl style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: '1fr 1fr', margin: '0.875rem 0 0' }}>
        <Numero rotulo={t('numero_usos')} valor={String(dados.usos_mes)} />
        <Numero rotulo={t('numero_vistas')} valor={String(dados.vistas_mes)} />
        <div style={{ gridColumn: '1 / -1' }}>
          <Numero rotulo={t('numero_pico')} valor={pico} pequeno />
        </div>
      </dl>

      <div className="clube-codigo-caixa" style={{ marginTop: '1rem' }}>
        <p className="clube-codigo-legenda">{t('codigo_hoje')}</p>
        <p className="clube-codigo">{dados.codigo_hoje}</p>
        <p className="clube-codigo-legenda" style={{ marginTop: '0.25rem' }}>
          {t('codigo_ajuda')}
        </p>
      </div>

      <h3 className="clube-nome" style={{ marginTop: '1.5rem', fontSize: '1.0625rem' }}>
        {t('recentes')}
      </h3>
      {dados.usos.length === 0 ? (
        <p className="clube-regra">{t('recentes_vazio')}</p>
      ) : (
        <ul style={{ listStyle: 'none', margin: '0.5rem 0 0', padding: 0 }}>
          {dados.usos.map((u) => (
            <li
              key={`${u.criado_em}-${u.codigo}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '1rem',
                padding: '0.5rem 0',
                borderBottom: '1px solid var(--c-borda)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <span>{quando(u.criado_em)}</span>
              <span style={{ fontWeight: 700 }}>{u.codigo}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function Numero({ rotulo, valor, pequeno }: { rotulo: string; valor: string; pequeno?: boolean }) {
  return (
    <div className="clube-card" style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column-reverse' }}>
      <dt className="clube-regra" style={{ marginTop: '0.25rem' }}>
        {rotulo}
      </dt>
      <dd
        style={{
          margin: 0,
          fontFamily: 'var(--font-clube-titulo), system-ui, sans-serif',
          fontWeight: 800,
          fontSize: pequeno ? '1.0625rem' : '1.875rem',
          lineHeight: 1.1,
        }}
      >
        {valor}
      </dd>
    </div>
  )
}
