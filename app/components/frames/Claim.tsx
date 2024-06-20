'use client'
import { useParams } from 'react-router-dom'

export default function Claim() {
  const { ticket } = useParams()
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      {ticket}
    </div>
  )
}
