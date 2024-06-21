'use client'
import { FaCircleNotch } from 'react-icons/fa6'

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <FaCircleNotch className="text-6xl animate-spin" />
      <span className="text-4xl pt-3 font-bold tracking-normal">twentysix</span>
      <span className="pl-10 text-xl  italic font-bold">Soulbound</span>
    </div>
  )
}
