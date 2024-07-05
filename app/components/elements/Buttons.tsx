'use client'
import { Button } from '@nextui-org/react'
import { type ClassName, cn } from '@utils/tw'
import { useNavigate } from 'react-router-dom'

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
  label: React.ReactNode
  className?: ClassName
}) {
  const navigate = useNavigate()
  return (
    <Button
      variant="ghost"
      className={cn(
        'font-bold text-black hover:text-white bg-white hover:!bg-[#5100cd] border-1.5 border-black w-44',
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
  isIdle,
  isLoading,
  onClick,
  className,
}: {
  label: React.ReactNode
  isActive: boolean
  isIdle?: boolean
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
            ? 'text-purple hover:text-white hover:!bg-[#5100cd] button-halo'
            : isIdle && !isLoading
              ? 'hover:text-white hover:!bg-[#5100cd]'
              : 'pointer-events-none cursor-not-allowed disabled:!bg-gray-200',
          className
        )}
        onClick={onClick}
      >
        {label}
      </Button>
    </LoadingWrapper>
  )
}
