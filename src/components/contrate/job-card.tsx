import { Briefcase, Phone } from 'lucide-react'
import type { JobListing } from '@/types/database'
import { CONTRACT_TYPE_LABELS } from '@/types/database'

interface Props { job: JobListing }

export function JobCard({ job }: Props) {
  const wa = `https://wa.me/${job.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Vi a vaga de ${job.title} no Vive Gostoso e tenho interesse. Podemos conversar?`)}`

  return (
    <div className="bg-white rounded-2xl border border-[#E8E4DF] p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Icon placeholder */}
        <div className="w-12 h-12 rounded-xl bg-ocre/10 flex items-center justify-center flex-shrink-0">
          <Briefcase className="w-5 h-5 text-ocre" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-[#1A1A1A] text-base leading-snug">{job.title}</h3>
          <p className="text-ocre text-sm font-medium mt-0.5">{job.business_name}</p>
        </div>
        <span className="flex-shrink-0 bg-ocre/10 text-ocre text-xs font-semibold px-3 py-1 rounded-full">
          {CONTRACT_TYPE_LABELS[job.contract_type]}
        </span>
      </div>

      {job.description && (
        <p className="text-[#737373] text-sm mt-3 leading-relaxed line-clamp-3">{job.description}</p>
      )}

      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center justify-center gap-2 w-full bg-[#25D366] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#1ebe5d] transition-colors"
      >
        <Phone className="w-4 h-4" />
        Tenho interesse
      </a>
    </div>
  )
}
