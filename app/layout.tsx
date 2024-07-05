import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navbar from '@components/layout/Navbar'
import AppState from '@context/AppState'
import NextUI from '@context/NextUI'
import Web3ModalProvider from '@context/Wallet'
import font from '@utils/fonts'

const SITE_NAME = '26 Claim'
const SITE_DESCRIPTION = 'Exclusive Free Allocations on TwentySix'
const SITE_URL = 'https://claim.twentysix.cloud'
const SOCIAL_TWITTER = 'https://x.com/TwentySixCloud'

export const metadata: Metadata = {
  applicationName: SITE_NAME,
  title: SITE_NAME,
  metadataBase: new URL(SITE_URL),
  description: SITE_DESCRIPTION,
  manifest: '/manifest.json',
  appLinks: {
    web: {
      url: SITE_URL,
      should_fallback: true,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    title: SITE_NAME,
    capable: true,
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    type: 'website',
    title: SITE_NAME,
    siteName: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: '/opensea/featured-image.jpg',
        width: 2560,
        height: 1600,
      },
      {
        url: '/512x512.png',
        width: 512,
        height: 512,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: SOCIAL_TWITTER,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/opensea/featured-image.jpg',
        width: 2560,
        height: 1600,
      },
      {
        url: '/512x512.png',
        width: 512,
        height: 512,
      },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: 'black',
  colorScheme: 'only light',
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
img-src 'self' data: blob: https://walletconnect.org https://walletconnect.com https://secure.walletconnect.com https://secure.walletconnect.org https://tokens-data.1inch.io https://tokens.1inch.io https://ipfs.io https://cdn.zerion.io;
font-src 'self' https://fonts.gstatic.com;
connect-src 'self' https://rpc.walletconnect.com https://rpc.walletconnect.org https://explorer-api.walletconnect.com https://explorer-api.walletconnect.org https://relay.walletconnect.com https://relay.walletconnect.org wss://relay.walletconnect.com wss://relay.walletconnect.org https://pulse.walletconnect.com https://pulse.walletconnect.org https://api.web3modal.com https://api.web3modal.org https://keys.walletconnect.com https://keys.walletconnect.org https://notify.walletconnect.com https://notify.walletconnect.org https://echo.walletconnect.com https://echo.walletconnect.org https://push.walletconnect.com https://push.walletconnect.org wss://www.walletlink.org rpc.sepolia.org cloudflare-eth.com https://eth-sepolia.public.blastapi.io wss://ethereum-sepolia-rpc.publicnode.com wss://avalanche-c-chain-rpc.publicnode.com https://ava-mainnet.public.blastapi.io https://api.gelato.digital wss://api.gelato.digital;
frame-src 'self' https://verify.walletconnect.com https://verify.walletconnect.org https://secure.walletconnect.com https://secure.walletconnect.org;`
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Content-Security-Policy" content={csp} />
      </head>
      <body className={font.className}>
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
