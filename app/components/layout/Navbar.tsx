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
          'flex flex-row w-full items-center justify-between bg-white',
          mobile ? 'h-20 pl-3 pr-1' : 'h-24 px-6'
        )}
      >
        <a
          className="flex flex-col items-center"
          href={'https://www.twentysix.cloud/'}
        >
          <Image
            src="/26-horizontal.png"
            alt="TwentySix Claim"
            width={mobile ? 150 : 200}
            radius="none"
          />
          <span
            className={cn(
              'font-extrabold italic absolute text-black z-5',
              mobile
                ? 'text-sm top-[41px] left-[124px]'
                : 'text-xl top-[50px] left-[172px]'
            )}
          >
            Claim
          </span>
        </a>
        <w3m-button
          size="sm"
          balance={mobile ? 'hide' : 'show'}
          label={isConnected ? ensName || address : undefined}
        />
      </div>
      <div className="flex flex-col w-full h-full overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
