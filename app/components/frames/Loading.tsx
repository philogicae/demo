'use client'
import { FaCircleNotch } from 'react-icons/fa6'

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-black">
      <FaCircleNotch className="text-6xl animate-spin" />
      <span className="text-4xl pt-3 font-extrabold tracking-normal">
        TwentySix
      </span>
      <span className="pl-32 text-2xl  italic font-extrabold">Claim</span>
    </div>
  )
}
