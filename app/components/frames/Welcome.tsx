'use client'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChainId } from 'wagmi'
import load from '@contracts/loader'
import { useCall } from '@hooks/useCall'
import { Button, Divider } from '@nextui-org/react'

export default function Welcome() {
  const navigate = useNavigate()
  const chainId = useChainId()
  const contract = load('TRY26', chainId)
  const [data, setData] = useState({
    batches: '-',
    tickets: '-',
    claimed: '-',
  })

  const { fetch } = useCall({
    calls: [
      {
        chainId: chainId,
        contract: contract!,
        functionName: 'totalBatches',
      },
      {
        chainId: chainId,
        contract: contract!,
        functionName: 'totalTickets',
      },
      {
        chainId: chainId,
        contract: contract!,
        functionName: 'totalSupply',
      },
    ],
    initData: [
      {
        totalBatches: 0,
        totalTickets: 0,
        totalSupply: 0,
      },
    ],
  })

  useEffect(() => {
    fetch()
      .then((result) => {
        const { totalBatches, totalTickets, totalSupply } = result.data!
        setData({
          batches: Number(totalBatches).toString(),
          tickets: Number(totalTickets).toString(),
          claimed: Number(totalSupply).toString(),
        })
      })
      .catch((err) => {
        console.error('Error during call:', err)
      })
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-2 pb-14">
      <div className="flex flex-col items-center w-[270px] justify-center gap-2 p-2 pt-1 rounded-lg bg-white bg-opacity-10">
        <span className="text-lg font-bold">TRY26 Metrics</span>
        <div className="flex flex-row gap-2">
          <div className="flex flex-col items-center justify-center p-1 rounded-lg bg-white bg-opacity-10">
            <span className="text-center px-2 font-semibold">Batches</span>
            <Divider className="bg-opacity-30 bg-white mt-1" />
            <span className="font-semibold">{data.batches}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-1 rounded-lg bg-white bg-opacity-10">
            <span className="text-center px-2 font-semibold">Tickets</span>
            <Divider className="bg-opacity-30 bg-white mt-1" />
            <span className="font-semibold">{data.tickets}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-1 rounded-lg bg-white bg-opacity-10">
            <span className="text-center px-2 font-semibold">Claimed</span>
            <Divider className="bg-opacity-30 bg-white mt-1" />
            <span className="font-semibold">{data.claimed}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col w-[270px] items-center justify-center gap-4 p-3 rounded-lg bg-white bg-opacity-10">
        <Button
          variant="ghost"
          className="font-bold text-white hover:text-black w-44"
          onClick={() => navigate('/create')}
        >
          Create New Batch
        </Button>
        <Button
          variant="ghost"
          className="font-bold text-white hover:text-black w-44"
          onClick={() => navigate('/claim/TODO')}
        >
          Example Claim Page
        </Button>
        <Button
          variant="ghost"
          className="font-bold text-white hover:text-black w-44"
          onClick={() => navigate('/token/1')}
        >
          Example Token Page
        </Button>
      </div>
      <div className="flex items-center w-[270px] justify-center p-2 rounded-lg bg-white bg-opacity-10">
        <span className="text-sm">This is a demo.</span>
      </div>
    </div>
  )
}
