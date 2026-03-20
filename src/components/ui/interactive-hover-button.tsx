"use client"

import React, { useMemo, useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type InteractiveHoverButtonProps = {
  text?: string
  loadingText?: string
  successText?: string
  classes?: string
  disabled?: boolean
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  className?: string
  type?: "button" | "submit" | "reset"
  id?: string
  ariaLabel?: string
}

/**
 * Interactive Hover Button Component
 * - Uses framer-motion to animate between idle/loading/success states.
 * - Calls the provided `onClick` prop and sets success when it resolves (if it returns a Promise).
 */
export default function InteractiveHoverButton({
  text = 'Button',
  loadingText = 'Processing...',
  successText = 'Complete!',
  classes,
  disabled,
  onClick,
  className,
  type = 'button',
  id,
  ariaLabel,
}: InteractiveHoverButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const isIdle = status === 'idle'

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isIdle || disabled) return

    try {
      const result = onClick?.(e)
      const maybePromise = result as unknown
      const isPromiseLike =
        !!maybePromise && typeof (maybePromise as Promise<unknown>).then === 'function'

      // For non-async actions, don't switch UI into loading/success.
      if (!isPromiseLike) return

      setStatus('loading')
      await (maybePromise as Promise<unknown>)

      setStatus('success')
      window.setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      console.error('InteractiveHoverButton onClick failed:', err)
      setStatus('idle')
    }
  }

  const buttonClass = useMemo(
    () =>
      cn(
        'group bg-background relative flex min-w-0 items-center justify-center overflow-hidden rounded-lg border p-2 px-6 font-semibold',
        status === 'loading' && 'px-2', // Circle shape when loading
        className,
        classes
      ),
    [status, className, classes]
  )

  return (
    <motion.button
      type={type}
      className={buttonClass}
      onClick={handleClick}
      layout
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      disabled={disabled}
      id={id}
      aria-label={ariaLabel}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key="content"
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div
            className={cn(
              'bg-primary h-2 w-2 rounded-full transition-all duration-500 group-hover:scale-[40]',
              !isIdle && 'scale-[40]'
            )}
          />

          <span
            className={cn(
              'inline-block transition-all duration-500 group-hover:translate-x-20 group-hover:opacity-0',
              !isIdle && 'translate-x-20 opacity-0'
            )}
          >
            {text}
          </span>

          <div
            className={cn(
              'text-primary-foreground absolute top-0 left-0 z-10 flex h-full w-full -translate-x-16 items-center justify-center gap-2 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100',
              !isIdle && 'translate-x-0 opacity-100'
            )}
          >
            {status === 'idle' ? (
              <>
                <span>{text}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            ) : status === 'loading' ? (
              <>
                <div
                  aria-hidden
                  className="h-4 w-4 animate-spin rounded-full border-2"
                  style={{
                    borderColor: "color-mix(in srgb, var(--accent-blue) 28%, transparent)",
                    borderTopColor: "var(--accent-blue)",
                  }}
                />
                <span>{loadingText}</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>{successText}</span>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.button>
  )
}
