'use client'
import { useParams } from 'react-router-dom'

export default function Token() {
  const { id } = useParams()
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      {id}
    </div>
  )
}
