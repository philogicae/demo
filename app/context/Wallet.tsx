'use client'
import Loading from '@components/frames/Loading'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { useEffect, useState } from 'react'
import { http, WagmiProvider, fallback, webSocket } from 'wagmi'
import { sepolia /* avalanche */ } from 'wagmi/chains'

const queryClient = new QueryClient()

if (!process.env.NEXT_PUBLIC_WALLETCONNECT_ID)
  throw new Error('NEXT_PUBLIC_WALLETCONNECT_ID is not defined')
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID

const metadata = {
  name: 'TwentySix Soulbound',
  description: 'Exclusive Free Allocations on TwentySix',
  url: 'https://26-soulbound.istest.eth.limo',
  icons: ['https://26-soulbound.istest.eth.limo/favicon-32x32.png'],
}

export const txType: Record<number, 'eip1559' | 'legacy'> = {
  [sepolia.id]: 'eip1559',
  //[avalanche.id]: 'eip1559',
}

const chains = [sepolia] as const
export const defaultChain = chains[0]
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  transports: {
    [sepolia.id]: fallback([
      webSocket('wss://ethereum-sepolia-rpc.publicnode.com'),
      http('https://eth-sepolia.public.blastapi.io'),
      http(),
    ]),
    /* [avalanche.id]: fallback([
      webSocket('wss://avalanche-c-chain-rpc.publicnode.com'),
      http('https://ava-mainnet.public.blastapi.io/ext/bc/C/rpc'),
      http(),
    ]), */
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
    '--w3m-color-mix-strength': 10,
    '--w3m-border-radius-master': '2px',
  },
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
