'use client'
import { useAppState } from '@context/AppState'
import { Image } from '@nextui-org/react'
import { cn } from '@utils/tw'
import { useAccount, useEnsName } from 'wagmi'

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
          mobile ? 'h-16 pl-3 pr-1' : 'h-20 px-6'
        )}
      >
        <a
          className="flex flex-col items-center"
          href={'https://26-soulbound.istest.eth.limo'}
        >
          <Image
            src="/26-horizontal.png"
            alt="TwentySix Soulbound"
            width={mobile ? 150 : 200}
            height={50}
            radius="none"
          />
          <span
            className={cn(
              'text-xl font-extrabold italic absolute text-black z-5',
              mobile
                ? 'text-md top-[35px] left-[77px]'
                : 'text-xl top-[44px] left-[110px]'
            )}
          >
            Soulbound
          </span>
        </a>
        <div className={cn(mobile ? 'pt-2' : 'pt-2')}>
          <w3m-button
            size="sm"
            balance={mobile ? 'hide' : 'show'}
            label={isConnected ? ensName || address : undefined}
          />
        </div>
      </div>
      <div className="flex flex-col w-full h-full overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
