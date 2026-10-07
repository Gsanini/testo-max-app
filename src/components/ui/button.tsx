// shadcn/ui Button, adaptado ao sistema visual TestoMAX (MIT).
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva('button inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50', {
  variants: {
    variant: { default: 'button-primary', secondary: 'button-secondary', ghost: 'button-ghost', destructive: 'button-destructive', outline: 'button-outline' },
    size: { default: 'button-default', sm: 'button-sm', icon: 'button-icon' },
  }, defaultVariants: {variant: 'default', size: 'default'},
})
export function Button({className, variant, size, asChild = false, ...props}: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & {asChild?: boolean}) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({variant, size, className}))} {...props}/>
}
