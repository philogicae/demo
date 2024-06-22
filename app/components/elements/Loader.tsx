'use client'
import { useEffect } from 'react'

export function Loader({
  size,
  speed,
  color,
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
  return <l-bouncy size={size} speed={speed} color={color} />
}

export default function LoaderPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <Loader size={70} speed={1.5} color="white" />
    </div>
  )
}
