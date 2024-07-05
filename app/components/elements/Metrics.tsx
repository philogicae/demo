'use client'
import load from '@contracts/loader'
import { useCall } from '@hooks/useCall'
import { Divider } from '@nextui-org/react'
import { useEffect, useState } from 'react'
import { useChainId } from 'wagmi'

export function Metrics() {
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
        chainId,
        contract: contract!,
        functionName: 'totalBatches',
      },
      {
        chainId,
        contract: contract!,
        functionName: 'totalTickets',
      },
      {
        chainId,
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
  }, [chainId])

  return (
    <div className="flex flex-col items-center w-[270px] justify-center gap-2 p-2 rounded-lg bg-violet-400 bg-opacity-10">
      <span className="text-md text-center font-extrabold italic text-black w-full pb-0.5 rounded-lg bg-white bg-opacity-80">
        TRY26 Metrics
      </span>
      <div className="flex flex-row gap-3 text-sm">
        <div className="flex flex-col items-center justify-center p-1 rounded-lg bg-white bg-opacity-80">
          <span className="text-black text-center px-2 font-semibold">
            Batches
          </span>
          <Divider className="bg-gray-300 my-1" />
          <span className="font-semibold">{data.batches}</span>
        </div>
        <div className="flex flex-col items-center justify-center p-1 rounded-lg bg-white bg-opacity-80">
          <span className="text-black text-center px-2 font-semibold">
            Tickets
          </span>
          <Divider className="bg-gray-300 my-1" />
          <span className="font-semibold">{data.tickets}</span>
        </div>
        <div className="flex flex-col items-center justify-center p-1 rounded-lg bg-white bg-opacity-80">
          <span className="text-black text-center px-2 font-semibold">
            Claimed
          </span>
          <Divider className="bg-gray-300 my-1" />
          <span className="font-semibold">{data.claimed}</span>
        </div>
      </div>
    </div>
  )
}
