'use client'
import { FaCircleNotch } from 'react-icons/fa6'

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <FaCircleNotch className="text-6xl animate-spin" />
      <span className="text-3xl pt-6 pb-2">TwentySix</span>
      <span className="text-3xl">Soulbound</span>
    </div>
  )
}
