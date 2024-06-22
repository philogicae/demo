'use client'
import { useNavigate } from 'react-router-dom'
import { ClassName, cn } from '@utils/tw'
import { Button } from '@nextui-org/react'

export function LoadingWrapper({
  children,
  isLoading,
}: {
  children: React.ReactNode
  isLoading: boolean
}) {
  return (
    <div className="overflow-hidden rounded-xl">
      <div
        className={cn(
          'relative z-10 border-2 border-transparent',
          isLoading && 'loading-button pointer-events-none cursor-not-allowed'
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function LinkButton({
  page,
  label,
  className,
}: {
  page: string
  label: string
  className?: ClassName
}) {
  const navigate = useNavigate()
  return (
    <Button
      variant="ghost"
      className={cn(
        'font-bold text-black hover:text-white bg-white hover:!bg-gray-950 border-1.5 border-black w-44',
        className
      )}
      onClick={() => navigate(page)}
    >
      {label}
    </Button>
  )
}

export function ActionButton({
  label,
  isActive,
  isLoading,
  onClick,
  className,
}: {
  label: string
  isActive: any
  isLoading: boolean
  onClick: () => void
  className?: ClassName
}) {
  return (
    <LoadingWrapper isLoading={isLoading}>
      <Button
        disabled={!isActive || isLoading}
        variant="ghost"
        className={cn(
          'flex flex-row w-28 font-bold bg-white border-1.5 border-black text-black',
          isActive && !isLoading
            ? 'hover:text-white hover:!bg-gray-950 button-halo'
            : 'pointer-events-none cursor-not-allowed',
          className
        )}
        onClick={onClick}
      >
        {label}
      </Button>
    </LoadingWrapper>
  )
}
