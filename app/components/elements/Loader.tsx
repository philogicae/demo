'use client'
import { useMemo } from 'react'

export function Loader({
  size,
  speed,
  color,
}: {
  size?: number
  speed?: number
  color?: string
}) {
  const loader = useMemo(async () => {
    const { bouncy } = await import('ldrs')
    bouncy.register()
    return <l-bouncy size={size} speed={speed} color={color} />
  }, [size, speed, color])
  return loader
}

export default function LoaderPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <Loader size={70} speed={1.5} color="white" />
    </div>
  )
}
