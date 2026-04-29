import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useNotifications, useMarkAllNotificationsRead } from '@/hooks/useNotifications'
import { cn } from '@/lib/utils'

function relativeTime(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'agora'
  if (m < 60) return `${m}min atrás`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h atrás`
  return `${Math.floor(h / 24)}d atrás`
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { data: notifications = [] } = useNotifications()
  const markAllRead = useMarkAllNotificationsRead()
  const unread = notifications.filter(n => !n.read).length

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function handleOpen() {
    setOpen(o => !o)
    if (!open && unread > 0) markAllRead.mutate()
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 flex items-center justify-center rounded-full text-[#3D3D3D] dark:text-[#C0BCB8] hover:bg-areia dark:hover:bg-[#2D2D2D] transition-colors"
        aria-label="Notificações"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-coral rounded-full flex items-center justify-center text-[9px] font-bold text-white leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-[#222] rounded-2xl border border-[#E8E4DF] dark:border-[#2D2D2D] shadow-xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#F5F2EE] dark:border-[#2D2D2D]">
            <span className="text-sm font-semibold text-[#1A1A1A] dark:text-white">Notificações</span>
            {notifications.some(n => !n.read) && (
              <button onClick={() => markAllRead.mutate()} className="text-xs text-teal hover:underline">
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#F5F2EE] dark:divide-[#2D2D2D]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-[#737373]">
                <Bell className="w-7 h-7 opacity-25" />
                <p className="text-sm">Nenhuma notificação ainda.</p>
              </div>
            ) : notifications.map(n => {
              const Wrapper = n.link ? Link : 'div'
              const wrapperProps = n.link
                ? { to: n.link, onClick: () => setOpen(false) }
                : {}
              return (
                <Wrapper
                  key={n.id}
                  {...(wrapperProps as any)}
                  className={cn(
                    'flex gap-3 px-4 py-3 transition-colors',
                    n.link ? 'hover:bg-areia dark:hover:bg-[#2D2D2D] cursor-pointer' : 'cursor-default',
                    !n.read && 'bg-teal/5',
                  )}
                >
                  <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0 transition-colors', !n.read ? 'bg-teal' : 'bg-transparent')} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A] dark:text-white leading-snug">{n.title}</p>
                    {n.body && <p className="text-xs text-[#737373] mt-0.5 leading-snug">{n.body}</p>}
                    <p className="text-[10px] text-[#A0A0A0] mt-1">{relativeTime(n.created_at)}</p>
                  </div>
                </Wrapper>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
