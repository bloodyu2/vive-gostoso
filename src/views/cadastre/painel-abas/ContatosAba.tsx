'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { BusinessSummary } from '@/hooks/useMyBusinesses'
import type { AbaId } from '@/lib/clube/painel-abas'
import { ConfirmarCupom, Resgates, useParceiro } from '../Passaporte'
import { EmbutidoClube } from './EmbutidoClube'
import { useManutencaoDoClube } from './PassaporteAba'

/** Aba Contatos: quem resgatou o cupom e autorizou o repasse, com busca, WhatsApp, marcar como
 *  usado e o botao Baixar CSV (todos os contatos, nao so os que a busca deixa na tela). */
export function ContatosAba({ negocio, onAba }: { negocio: BusinessSummary; onAba: (aba: AbaId) => void }) {
  const { t } = useTranslation('painel')
  const { t: tp } = useTranslation('passaporte')
  const parceiro = useParceiro(negocio.id)
  const [busca, setBusca] = useState('')
  useManutencaoDoClube()

  return (
    <EmbutidoClube>
      {parceiro.isLoading ? (
        <p className="clube-aviso">{tp('carregando')}</p>
      ) : parceiro.isError ? (
        <p className="clube-erro" role="alert">
          {tp('erro_carregar')}
        </p>
      ) : !parceiro.data ? (
        <section className="clube-card" style={{ padding: '1.25rem' }}>
          <h2 className="clube-nome">{t('abas.contatos_titulo')}</h2>
          <p className="clube-regra">{t('abas.contatos_sem_passaporte')}</p>
          <div className="clube-acoes">
            <button type="button" className="clube-btn clube-btn--verde" onClick={() => onAba('passaporte')}>
              {t('abas.cupons_ir_passaporte')}
            </button>
          </div>
        </section>
      ) : (
        <>
          <label htmlFor="contatos-busca" className="clube-tipo" style={{ display: 'block' }}>
            {t('abas.contatos_busca_rotulo')}
          </label>
          <input
            id="contatos-busca"
            className="clube-campo"
            type="search"
            inputMode="search"
            autoComplete="off"
            spellCheck={false}
            placeholder={t('abas.contatos_busca_dica')}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ marginTop: '0.375rem' }}
          />
          <Resgates parceiro={parceiro.data} negocio={negocio.name} busca={busca} slug={negocio.slug} />
          <ConfirmarCupom parceiroId={parceiro.data.id} />
        </>
      )}
    </EmbutidoClube>
  )
}
