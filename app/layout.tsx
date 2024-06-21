import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Web3ModalProvider from '@context/Wallet'
import NextUI from '@context/NextUI'
import AppState from '@context/AppState'
import Navbar from '@components/layout/Navbar'

const inter = Inter({ subsets: ['latin'], preload: true })

export const metadata: Metadata = {
  title: 'Twentysix Soulbound',
  description: 'Exclusive Free Allocations on TwentySix',
}

export const viewport: Viewport = {
  themeColor: 'black',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  if (typeof window !== 'undefined') {
    const storedVersion = localStorage.getItem('appVersion')
    if (storedVersion !== process.env.appVersion) {
      localStorage.setItem('appVersion', process.env.appVersion as string)
      window.location.reload()
    }
  }
  const csp = `default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: blob: https://walletconnect.org https://walletconnect.com https://secure.walletconnect.com https://secure.walletconnect.org https://tokens-data.1inch.io https://tokens.1inch.io https://ipfs.io;
font-src 'self' https://fonts.gstatic.com;
connect-src 'self' https://rpc.walletconnect.com https://rpc.walletconnect.org https://explorer-api.walletconnect.com https://explorer-api.walletconnect.org https://relay.walletconnect.com https://relay.walletconnect.org wss://relay.walletconnect.com wss://relay.walletconnect.org https://pulse.walletconnect.com https://pulse.walletconnect.org https://api.web3modal.com https://api.web3modal.org https://keys.walletconnect.com https://keys.walletconnect.org https://notify.walletconnect.com https://notify.walletconnect.org https://echo.walletconnect.com https://echo.walletconnect.org https://push.walletconnect.com https://push.walletconnect.org wss://www.walletlink.org rpc.sepolia.org cloudflare-eth.com https://eth-sepolia.public.blastapi.io wss://ethereum-sepolia-rpc.publicnode.com wss://avalanche-c-chain-rpc.publicnode.com https://ava-mainnet.public.blastapi.io;
frame-src 'self' https://verify.walletconnect.com https://verify.walletconnect.org https://secure.walletconnect.com https://secure.walletconnect.org;`
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Content-Security-Policy" content={csp} />
      </head>
      <body className={inter.className}>
        <Web3ModalProvider>
          <NextUI>
            <AppState>
              <Navbar>{children}</Navbar>
            </AppState>
          </NextUI>
        </Web3ModalProvider>
      </body>
    </html>
  )
}
