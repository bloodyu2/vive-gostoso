// KAN-686: limite por visitante, bloqueio por abuso e teto diario do site.
// Em memoria da instancia: em serverless cada instancia tem o seu contador, entao o limite real
// pode ser mais frouxo do que o numero. Por isso existe o teto diario e o limite de tamanho, e o
// limite duro de gasto fica no provedor do modelo (conta com saldo limitado).

import { createHash } from 'node:crypto'
import { GUIA } from './config'

export type Decisao =
  | { ok: true }
  | { ok: false; motivo: 'hora' | 'dia' | 'bloqueado' | 'teto'; tentarEmSegundos: number }

type Estado = { horas: number[]; dia: number[]; abusos: number[]; bloqueadoAte: number }

const HORA = 60 * 60 * 1000
const DIA = 24 * HORA

/** Visitante anonimo: hash com sal de IP e navegador. O IP em claro nao e guardado nem registrado. */
export function chaveDoVisitante(ip: string, ua: string, sal: string): string {
  return createHash('sha256').update(`${sal}|${ip}|${ua.slice(0, 120)}`).digest('hex').slice(0, 24)
}

export function criarGuarda(agora: () => number = Date.now, tetoDiario = 600) {
  const visitantes = new Map<string, Estado>()
  let diaDoTeto = Math.floor(agora() / DIA)
  let usadoNoDia = 0

  function estadoDe(chave: string): Estado {
    let e = visitantes.get(chave)
    if (!e) {
      e = { horas: [], dia: [], abusos: [], bloqueadoAte: 0 }
      visitantes.set(chave, e)
      // poda simples para o mapa nao crescer sem fim
      if (visitantes.size > 5000) {
        const mais_velha = visitantes.keys().next().value
        if (mais_velha !== undefined) visitantes.delete(mais_velha)
      }
    }
    return e
  }

  function rolarTeto() {
    const hoje = Math.floor(agora() / DIA)
    if (hoje !== diaDoTeto) {
      diaDoTeto = hoje
      usadoNoDia = 0
    }
  }

  return {
    /** Conta uma mensagem se couber. Chamar uma vez por pedido, antes do modelo. */
    permitir(chave: string): Decisao {
      const t = agora()
      rolarTeto()
      const e = estadoDe(chave)
      if (e.bloqueadoAte > t) return { ok: false, motivo: 'bloqueado', tentarEmSegundos: Math.ceil((e.bloqueadoAte - t) / 1000) }
      e.horas = e.horas.filter((x) => t - x < HORA)
      e.dia = e.dia.filter((x) => t - x < DIA)
      if (usadoNoDia >= tetoDiario) return { ok: false, motivo: 'teto', tentarEmSegundos: Math.ceil(((diaDoTeto + 1) * DIA - t) / 1000) }
      if (e.dia.length >= GUIA.limiteDia) return { ok: false, motivo: 'dia', tentarEmSegundos: Math.ceil((e.dia[0] + DIA - t) / 1000) }
      if (e.horas.length >= GUIA.limiteHora) return { ok: false, motivo: 'hora', tentarEmSegundos: Math.ceil((e.horas[0] + HORA - t) / 1000) }
      e.horas.push(t)
      e.dia.push(t)
      usadoNoDia += 1
      return { ok: true }
    },
    /** Registra um pedido recusado pelo filtro. Retorna true se o visitante acabou de ser bloqueado. */
    registrarAbuso(chave: string): boolean {
      const t = agora()
      const e = estadoDe(chave)
      e.abusos = e.abusos.filter((x) => t - x < HORA)
      e.abusos.push(t)
      if (e.abusos.length >= GUIA.limiteAbusos) {
        e.bloqueadoAte = t + GUIA.bloqueioMs
        e.abusos = []
        return true
      }
      return false
    },
    usadoHoje(): number {
      rolarTeto()
      return usadoNoDia
    },
  }
}

export type Guarda = ReturnType<typeof criarGuarda>
