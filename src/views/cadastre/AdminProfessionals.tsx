// src/views/cadastre/AdminProfessionals.tsx
'use client'

import { Eye, EyeOff, Trash2 } from 'lucide-react'
import { AdminGuard } from '@/components/auth/admin-guard'
import {
  useAdminProfessionals,
  useToggleProfessionalPublished,
  useDeleteProfessional,
} from '@/hooks/useProfessionals'
import { PROFESSIONAL_CATEGORY_LABELS } from '@/types/professional'
import { useTranslation } from 'react-i18next'

export default function AdminProfessionals() {
  return <AdminGuard><AdminProfessionalsInner /></AdminGuard>
}

function AdminProfessionalsInner() {
  const { t, i18n } = useTranslation('admin_professionals')
  const { data: professionals = [], isLoading } = useAdminProfessionals()
  const togglePublished = useToggleProfessionalPublished()
  const deletePro = useDeleteProfessional()

  async function handleToggle(id: string, currentPublished: boolean) {
    await togglePublished.mutateAsync({ id, is_published: !currentPublished })
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(t('delete_confirm', { name }))) return
    await deletePro.mutateAsync(id)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[#1A1A1A]">
            {t('title', { count: professionals.length })}
          </h1>
        </div>

        {professionals.length === 0 ? (
          <p className="text-sm text-[#737373]">{t('empty')}</p>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E8E4DF] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F2EE] text-xs font-semibold text-[#737373] uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3">{t('th_name')}</th>
                  <th className="text-left px-5 py-3">{t('th_category')}</th>
                  <th className="text-left px-5 py-3">{t('th_whatsapp')}</th>
                  <th className="text-left px-5 py-3">{t('th_status')}</th>
                  <th className="text-left px-5 py-3">{t('th_created')}</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F2EE]">
                {professionals.map(pro => (
                  <tr key={pro.id} className="hover:bg-[#FAFAF9] transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[#1A1A1A]">{pro.display_name}</p>
                      <p className="text-xs text-[#737373] truncate max-w-xs">{pro.headline}</p>
                    </td>
                    <td className="px-5 py-3.5 text-[#555]">
                      {PROFESSIONAL_CATEGORY_LABELS[pro.category]}
                    </td>
                    <td className="px-5 py-3.5 text-[#555] font-mono text-xs">
                      {pro.whatsapp ?? '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        pro.is_published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-[#F5F2EE] text-[#737373]'
                      }`}>
                        {pro.is_published ? t('status_published') : t('status_draft')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#737373] text-xs">
                      {new Date(pro.created_at).toLocaleDateString(i18n.language === 'en' ? 'en-US' : i18n.language === 'es' ? 'es' : 'pt-BR')}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => handleToggle(pro.id, pro.is_published)}
                          className="p-1.5 rounded-lg text-[#737373] hover:text-[#1A1A1A] hover:bg-[#F5F2EE] transition-colors"
                          title={pro.is_published ? t('unpublish') : t('publish')}
                        >
                          {pro.is_published
                            ? <EyeOff className="w-4 h-4" />
                            : <Eye className="w-4 h-4" />
                          }
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(pro.id, pro.display_name)}
                          className="p-1.5 rounded-lg text-[#737373] hover:text-red-500 hover:bg-red-50 transition-colors"
                          title={t('delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
