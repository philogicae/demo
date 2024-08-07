'use client'
import { useEffect, useMemo } from 'react'

export function Loader({
  size = 30,
  speed,
  color = '#5100cd',
}: {
  size?: number
  speed?: number
  color?: string
}) {
  useEffect(() => {
    async function getLoader() {
      const { bouncy } = await import('ldrs')
      bouncy.register()
    }
    getLoader()
  }, [])
  return useMemo(() => {
    return <l-bouncy size={size} speed={speed} color={color} />
  }, [size, speed, color])
}

export default function LoaderPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <Loader size={70} speed={1.5} color="black" />
    </div>
  )
}
