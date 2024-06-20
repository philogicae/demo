'use client'
import { useNavigate } from 'react-router-dom'

const styleButton =
  'w-28 h-10 text-lg bg-sky-950 rounded-lg cursor-pointer hover:bg-sky-900 hover:shadow-lg'

export default function Welcome() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="flex flex-col items-center justify-center gap-3">
        <button className={styleButton} onClick={() => navigate('/create')}>
          Create
        </button>
        <button className={styleButton} onClick={() => navigate('/claim/abc')}>
          Claim
        </button>
        <button className={styleButton} onClick={() => navigate('/token/123')}>
          Token
        </button>
      </div>
    </div>
  )
}
