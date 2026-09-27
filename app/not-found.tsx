// app/not-found.tsx
import type { Metadata } from 'next'
import NotFound from '@/views/NotFound'

/* A 404 raiz fica fora de app/[lang] e nao recebe o idioma pelos params, entao
   o titulo e em portugues. O template do layout raiz completa com
   ' | Vive Gostoso'. */
export const metadata: Metadata = {
  title: 'Página não encontrada',
}

export default function NotFoundPage() {
  return <NotFound />
}