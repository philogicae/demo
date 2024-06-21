'use client'
import { NextUIProvider } from '@nextui-org/system'

export default function NextUI({ children }: { children: React.ReactNode }) {
  return <NextUIProvider>{children}</NextUIProvider>
}
