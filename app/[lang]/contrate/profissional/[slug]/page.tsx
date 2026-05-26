// app/[lang]/contrate/profissional/[slug]/page.tsx
import ProfessionalProfile from '@/views/ProfessionalProfile'

export const revalidate = 3600

type Props = { params: Promise<{ lang: string; slug: string }> }

export default async function ProfessionalProfilePage({ params }: Props) {
  const { slug } = await params
  return <ProfessionalProfile slug={slug} />
}
