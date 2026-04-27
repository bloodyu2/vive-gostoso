import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

const variants = {
  primary:   'bg-coral text-white hover:bg-[#C44A2C] shadow-sm hover:shadow-md',
  secondary: 'bg-transparent text-teal border-2 border-teal hover:bg-teal-light',
  ghost:     'bg-transparent text-teal hover:bg-teal-light',
  dark:      'bg-[#1A1A1A] text-white hover:bg-[#3D3D3D]',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-[15px] font-semibold transition-all duration-150 min-h-[46px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
)
Button.displayName = 'Button'
