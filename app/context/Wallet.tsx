'use client'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { WagmiProvider } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import Loading from '@components/frames/Loading'

const queryClient = new QueryClient()

if (!process.env.NEXT_PUBLIC_WALLETCONNECT_ID)
  throw new Error('NEXT_PUBLIC_WALLETCONNECT_ID is not defined')
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID

const metadata = {
  name: 'Demo',
  description: 'AppKit Example',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
}

const chains = [sepolia] as const
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  //...wagmiOptions
})

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  enableOnramp: false,
  allowUnsupportedChain: false,
  defaultChain: sepolia,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#0040ff',
    //'--w3m-border-radius-master': '2px',
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
