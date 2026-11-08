'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useLocalePath } from '@/hooks/useLocalePath'
import type { BusinessSummary } from '@/hooks/useMyBusinesses'
import { supabase } from '@/lib/supabase'
import { FormVantagem, Numeros, useParceiro } from '../Passaporte'
import { EmbutidoClube } from './EmbutidoClube'

/** Retencao de 12 meses: quem abre a area do parceiro pede a limpeza do que passou do prazo.
 *  A funcao tem prazo fixo, nao devolve nada e o publico nao a executa; se a migracao nao
 *  foi aplicada, o erro e ignorado (mesmo comportamento da tela antiga do Passaporte). */
export function useManutencaoDoClube() {
  useEffect(() => {
    void supabase.rpc('gostoso_club_manutencao').then(
      () => null,
      () => null,
    )
  }, [])
}

/** Aba Passaporte: os numeros do mes e a vantagem (liga, pausa, edita), como na tela antiga. */
export function PassaporteAba({ negocio }: { negocio: BusinessSummary }) {
  const { t } = useTranslation('passaporte')
  const lp = useLocalePath()
  const parceiro = useParceiro(negocio.id)
  useManutencaoDoClube()

  return (
    <EmbutidoClube>
      <h2 className="clube-h2" style={{ fontSize: '1.5rem' }}>
        {t('titulo')}
      </h2>
      <p className="clube-regra" style={{ marginBottom: '1.25rem' }}>
        {t('sub')}
      </p>

      {parceiro.isLoading ? (
        <p className="clube-aviso">{t('carregando')}</p>
      ) : parceiro.isError ? (
        <p className="clube-erro" role="alert">
          {t('erro_carregar')}
        </p>
      ) : (
        <>
          {!negocio.is_published || !negocio.active ? <p className="clube-aviso">{t('nao_publicado')}</p> : null}
          {parceiro.data ? <Numeros parceiro={parceiro.data} /> : null}
          <FormVantagem key={parceiro.data?.id ?? 'novo'} negocioId={negocio.id} parceiro={parceiro.data ?? null} />
          <p className="clube-nota">{t('nota')}</p>
          <p className="clube-nota">
            <Link href={lp('/clube')} style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>
              {t('ver_pagina')}
            </Link>
          </p>
        </>
      )}
    </EmbutidoClube>
  )
}
