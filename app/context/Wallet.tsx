'use client'
import Loading from '@components/frames/Loading'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { useEffect, useState } from 'react'
import { http, WagmiProvider, fallback, webSocket } from 'wagmi'
import { avalanche, sepolia } from 'wagmi/chains'

const queryClient = new QueryClient()

if (!process.env.NEXT_PUBLIC_WALLETCONNECT_ID)
  throw new Error('NEXT_PUBLIC_WALLETCONNECT_ID is not defined')
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID

const SITE_NAME = 'Twentysix Claim'
const SITE_DESCRIPTION = 'Exclusive Free Allocations on TwentySix'
const SITE_URL = 'https://claim.twentysix.cloud'
const metadata = {
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  icons: [`${SITE_URL}/512x512.png`],
}

export const txType: Record<number, 'eip1559' | 'legacy'> = {
  [avalanche.id]: 'eip1559',
  [sepolia.id]: 'eip1559',
}

const chains = [avalanche, sepolia] as const
export const defaultChain = chains[0]
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  transports: {
    [avalanche.id]: fallback([
      webSocket('wss://avalanche-c-chain-rpc.publicnode.com'),
      http('https://ava-mainnet.public.blastapi.io/ext/bc/C/rpc'),
      http(),
    ]),
    [sepolia.id]: fallback([
      webSocket('wss://ethereum-sepolia-rpc.publicnode.com'),
      http('https://eth-sepolia.public.blastapi.io'),
      http(),
    ]),
  },
})

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: false,
  enableOnramp: false,
  allowUnsupportedChain: false,
  defaultChain,
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#050011',
    '--w3m-border-radius-master': '2px',
    '--w3m-font-family': 'var(--font-rigid-square)',
  },
  /* features: {
    analytics: false,
    onramp: false,
    email: false,
    socials: false,
  }, */
})

export default function Web3ModalProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isReady, setReady] = useState(false)
  useEffect(() => {
    setReady(true)
  }, [])
  return !isReady ? (
    <Loading />
  ) : (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
