'use client'
import { LinkButton } from '@components/elements/Buttons'
import { FaArrowLeft, FaBan } from 'react-icons/fa6'

export default function Error404() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="flex flex-col items-center justify-center w-full h-full gap-6 text-black">
        <FaBan className="text-6xl" />
        <span className="text-2xl font-bold w-32 text-center">
          ---- 404 ---- Not Found
        </span>
        <LinkButton
          page={'/'}
          label={
            <div className="text-sm flex flex-row items-center justify-center">
              <FaArrowLeft />
              <span className="pl-2">MENU</span>
            </div>
          }
          className="w-24 h-10"
        />
      </div>
    </div>
  )
}
