'use client'
import Image from 'next/image'
import { useAppState } from '@context/AppState'
import { useAccount, useEnsName } from 'wagmi'
import { cn } from '@utils/tw'

export default function Navbar({ children }: { children: React.ReactNode }) {
  const { mobile } = useAppState()
  const { isConnected, address } = useAccount()
  const { data: ensName } = useEnsName({ address })
  return (
    <div id="navbar-wrapper" className="flex flex-col w-full h-full">
      <div
        id="topbar"
        className={cn(
          'flex flex-row w-full items-center justify-between px-3',
          mobile ? 'h-16' : 'h-20'
        )}
      >
        <a
          className="flex flex-row items-center gap-2"
          href={'https://demo.binaryeyelabs.xyz'}
        >
          <Image src="/512x512.png" alt="Demo" width={50} height={50} />
          <div className="text-2xl">Demo</div>
        </a>
        <w3m-button
          size="sm"
          balance="hide"
          label={isConnected ? ensName || address : undefined}
        />
      </div>
      {children}
    </div>
  )
}
