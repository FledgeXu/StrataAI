import * as React from 'react'

import { cn } from '@/lib/utils'

function Alert({ className, variant = 'default', ...props }: React.ComponentProps<'div'> & { variant?: 'default' | 'destructive' }) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(
        'relative w-full rounded-lg border p-4 text-sm',
        variant === 'destructive'
          ? 'border-destructive/50 bg-destructive/10 text-destructive'
          : 'border-border bg-background text-foreground',
        className,
      )}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="alert-title" className={cn('mb-1 font-medium leading-none tracking-tight', className)} {...props} />
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="alert-description" className={cn('text-sm opacity-90', className)} {...props} />
}

export { Alert, AlertDescription, AlertTitle }
