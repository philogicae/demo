'use client'
import { FaArrowLeft } from 'react-icons/fa6'

export default function Temp() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="flex flex-col items-center justify-center w-full h-full gap-6">
        <span className="text-2xl font-bold text-center w-56">
          Create a new batch of tickets to see examples
        </span>
        <a
          className={
            'w-20 h-8 text-lg bg-sky-950 rounded-lg cursor-pointer hover:bg-sky-900 hover:shadow-lg flex items-center justify-center font-mono tracking-tighter font-semibold'
          }
          href={`${window.location.origin}/#/`}
        >
          <div className="text-sm flex flex-row items-center justify-center">
            <FaArrowLeft />
            <span className="pl-2">MENU</span>
          </div>
        </a>
      </div>
    </div>
  )
}
