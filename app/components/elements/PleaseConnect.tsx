'use client'
import { FaWallet } from 'react-icons/fa6'

export default function PleaseConnect() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4">
      <FaWallet className="text-6xl" />
      <span className="text-xl font-bold w-48 text-center">
        Wallet Not Connected
      </span>
    </div>
  )
}
