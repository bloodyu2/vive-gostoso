import { Briefcase, Phone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { JobListing } from '@/types/database'
import { CONTRACT_TYPE_LABELS } from '@/types/database'
import { buildWhatsAppLink } from '@/lib/whatsapp'

interface Props { job: JobListing }

/**
 * Job postings are scanned, not browsed — a compact row (title, company,
 * contract-type badge, one-line description) rather than a full padded
 * image-card. The whole row is the WhatsApp CTA.
 */
export function JobCard({ job }: Props) {
  const { t } = useTranslation()
  const wa = buildWhatsAppLink(
    job.whatsapp,
    `Olá! Vi a vaga de ${job.title} no Vive Gostoso e tenho interesse. Podemos conversar?`,
  )

  return (
    <a
      href={wa}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 bg-white border border-[#E8E4DF] rounded-xl px-4 py-3 hover:border-ocre hover:shadow-sm transition-all"
    >
      <div className="w-9 h-9 rounded-lg bg-ocre/10 flex items-center justify-center flex-shrink-0">
        <Briefcase className="w-4 h-4 text-ocre" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-[#1A1A1A] text-sm truncate">{job.title}</h3>
          <span className="flex-shrink-0 bg-ocre/10 text-ocre text-[10px] font-semibold px-2 py-0.5 rounded-full">
            {CONTRACT_TYPE_LABELS[job.contract_type]}
          </span>
        </div>
        <p className="text-xs text-[#737373] truncate">
          {job.business_name}
          {job.description ? ` · ${job.description}` : ''}
        </p>
      </div>

      <span className="flex-shrink-0 hidden sm:flex items-center gap-1.5 text-xs font-semibold text-teal group-hover:text-teal-dark">
        <Phone className="w-3.5 h-3.5" />
        {t('contrate.tenho_interesse')}
      </span>
    </a>
  )
}
