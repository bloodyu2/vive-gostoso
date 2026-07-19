'use client'
import { useSyncExternalStore } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

let toastQueue: Toast[] = []
let listeners: (() => void)[] = []

function notify(message: string, type: ToastType = 'info') {
  const toast: Toast = {
    id: Math.random().toString(36).slice(2),
    message,
    type,
  }
  toastQueue = [...toastQueue, toast]
  notifyListeners()

  setTimeout(() => {
    toastQueue = toastQueue.filter(t => t.id !== toast.id)
    notifyListeners()
  }, 5000)
}

function notifyListeners() {
  listeners.forEach(fn => fn())
}

function subscribe(callback: () => void) {
  listeners.push(callback)
  return () => {
    listeners = listeners.filter(l => l !== callback)
  }
}

function getSnapshot() {
  return toastQueue
}

/** External-store subscription (not useEffect+useState) — avoids the
 * setState-in-effect cascading-render issue for this global pub/sub queue. */
export function useToast() {
  const toasts = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return { toasts }
}

export function showToast(message: string, type: ToastType = 'info') {
  notify(message, type)
}

export function ToastContainer() {
  const { toasts } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-[9999] space-y-3 max-w-sm">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur ${
            toast.type === 'success'
              ? 'bg-green-50/95 border-green-200 text-green-900'
              : toast.type === 'error'
              ? 'bg-red-50/95 border-red-200 text-red-900'
              : 'bg-white/95 border-gray-200 text-gray-900'
          }`}
        >
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />}
          
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          
          <button
            onClick={() => {
              toastQueue = toastQueue.filter(t => t.id !== toast.id)
              notifyListeners()
            }}
            className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}