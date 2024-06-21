'use client'
import { useNavigate } from 'react-router-dom'
import { Button } from '@nextui-org/react'

export default function Welcome() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="flex flex-col items-center justify-center gap-3">
        <Button
          variant="ghost"
          className="font-bold"
          onClick={() => navigate('/create')}
        >
          Create
        </Button>
        <Button
          variant="ghost"
          className="font-bold"
          onClick={() => navigate('/claim/abc')}
        >
          Claim
        </Button>
        <Button
          variant="ghost"
          className="font-bold"
          onClick={() => navigate('/token/123')}
        >
          Token
        </Button>
      </div>
    </div>
  )
}
