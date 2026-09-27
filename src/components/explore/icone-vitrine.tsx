import {
  BedDouble,
  Briefcase,
  CalendarDays,
  Car,
  Compass,
  HeartHandshake,
  Landmark,
  Map,
  Newspaper,
  Utensils,
  Waves,
  type LucideIcon,
} from 'lucide-react'
import type { IconeVitrine } from '@/lib/explore/vitrine'

const ICONES: Record<IconeVitrine, LucideIcon> = {
  waves: Waves,
  utensils: Utensils,
  'bed-double': BedDouble,
  compass: Compass,
  map: Map,
  calendar: CalendarDays,
  landmark: Landmark,
  'heart-handshake': HeartHandshake,
  briefcase: Briefcase,
  car: Car,
  newspaper: Newspaper,
}

export function IconeVitrineSvg({ nome, className }: { nome: IconeVitrine; className?: string }) {
  const Icone = ICONES[nome]
  return <Icone aria-hidden="true" className={className} />
}
