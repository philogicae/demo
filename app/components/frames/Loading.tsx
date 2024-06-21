'use client'
import { FaCircleNotch } from 'react-icons/fa6'

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <FaCircleNotch className="text-6xl animate-spin" />
      <span className="text-3xl pt-4 font-semibold italic">TwentySix</span>
      <span className="text-2xl  italic">Soulbound</span>
    </div>
  )
}
