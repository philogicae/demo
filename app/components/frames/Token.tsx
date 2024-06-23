'use client'
import LoaderPage from '@components/elements/Loader'
import { Metadata } from '@components/elements/Metadata'
import load from '@contracts/loader'
import metadatas from '@contracts/metadatas.json'
import { useCall } from '@hooks/useCall'
import { formatDate } from '@utils/convert'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useChainId } from 'wagmi'

const prepare = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }
  if (Array.isArray(obj)) {
    return obj.map(prepare)
  }
  const result: any = {}
  Object.entries(obj).forEach(([k, v]) => {
    if (k === 'createdAt') result[k] = formatDate(Number(v))
    else if (k === 'ticketId')
      result[k] =
        `${(v as string).slice(0, 10)}...${(v as string).slice(-9, -1)}`
    else if (typeof v === 'bigint') result[k] = Number(v)
    else result[k] = prepare(v)
  })
  return result
}

export default function Token() {
  const navigate = useNavigate()
  const { id } = useParams()
  const chainId = useChainId()
  const contract = load('TRY26', chainId)
  if (!contract) navigate('/404')
  const [metadata, setMetadata] = useState({
    id,
    data: { name: '' },
    extra: {},
  })

  const { fetch } = useCall({
    calls: [
      {
        chainId,
        contract: contract!,
        functionName: 'getFullToken',
        args: [Number(id)],
      },
    ],
    initData: [
      {
        token: {
          owner: '',
          batchId: BigInt(0),
          ticketId: '',
        },
        batch: {
          metadataId: BigInt(0),
          createdAt: BigInt(0),
          creator: '',
          totalTickets: BigInt(0),
        },
      },
    ],
  })

  useEffect(() => {
    fetch()
      .then((result) => {
        if (!result.data?.getFullToken.token.batchId) navigate('/404')
        const { token, batch } = prepare(result.data?.getFullToken)
        setMetadata({
          data: (metadatas as Record<string, any>)[batch.metadataId],
          id,
          extra: { ...token, ...batch },
        })
      })
      .catch((err) => {
        console.error('Error during call:', err)
        navigate('/404')
      })
  }, [id])

  return metadata.data?.name ? (
    <div className="flex flex-col items-center justify-center w-full mt-10 mb-4 gap-2">
      <span className="text-3xl rounded-xl text-gray-950 bg-white bg-opacity-30 px-2 font-semibold font-mono">
        TRY26#{metadata.id}
      </span>
      <Metadata data={metadata.data} id={metadata.id} extra={metadata.extra} />
    </div>
  ) : (
    <LoaderPage />
  )
}
