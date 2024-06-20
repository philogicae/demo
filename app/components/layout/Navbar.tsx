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
          'flex flex-row w-full items-center justify-between',
          mobile ? 'h-20 pl-4 pr-2' : 'h-24 pl-6 pr-4'
        )}
      >
        <a
          className="flex flex-row items-center gap-2"
          href={'https://demo.binaryeyelabs.xyz'}
        >
          <Image
            src={mobile ? '/26-icon.png' : '/26-horizontal.png'}
            alt="TwentySix Soulbound"
            width={mobile ? 40 : 200}
            height={mobile ? 40 : 50}
          />
        </a>
        <w3m-button
          size="sm"
          balance={mobile ? 'hide' : 'show'}
          label={isConnected ? ensName || address : undefined}
        />
      </div>
      {children}
    </div>
  )
}
