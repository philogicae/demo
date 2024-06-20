import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Web3ModalProvider from '@context/Wallet'
import AppState from '@context/AppState'
import Navbar from '@components/layout/Navbar'

const inter = Inter({ subsets: ['latin'], preload: true })

export const metadata: Metadata = {
  title: 'Demo',
  description: 'Demo',
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
  const csp = `default-src 'self' api.web3modal.com *.walletconnect.com *.walletconnect.org wss://relay.walletconnect.com wss://relay.walletconnect.org wss://www.walletlink.org/rpc rpc.sepolia.org cloudflare-eth.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' * blob: data:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; object-src data:`
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Content-Security-Policy" content={csp} />
      </head>
      <body className={inter.className}>
        <Web3ModalProvider>
          <AppState>
            <Navbar>{children}</Navbar>
          </AppState>
        </Web3ModalProvider>
      </body>
    </html>
  )
}
