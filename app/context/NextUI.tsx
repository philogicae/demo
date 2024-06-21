'use client'
import { NextUIProvider } from '@nextui-org/react'

export default function NextUI({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider className="flex h-full w-full">{children}</NextUIProvider>
  )
}
