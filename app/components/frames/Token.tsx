'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useChainId } from 'wagmi'
import load from '@contracts/loader'
import Loader from '@components/elements/Loader'
import { useCall } from '@hooks/useCall'
import { formatDate } from '@utils/convert'
import metadatas from '@contracts/metadatas.json'
import { Metadata } from '@components/elements/Metadata'

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
  const done = useRef(false)
  const { fetch, result, isSuccess, isError } = useCall({
    calls: [
      {
        chainId: chainId,
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
    console.log(done.current, isSuccess, isError)
    if (isSuccess && !done.current) {
      const r = prepare(result.getFullToken)
      if (r.token.batchId === 0) navigate('/404')
      else {
        setMetadata({
          data: (metadatas as Record<string, any>)[r.batch.metadataId],
          id,
          extra: { ...r.token, ...r.batch },
        })
        done.current = true
      }
    }
    if (isError) navigate('/404')
  }, [isSuccess, isError])
  useEffect(() => {
    done.current = false
    fetch()
  }, [id])
  return done.current ? (
    <div className="flex flex-col items-center justify-center w-full gap-5">
      <span className="text-3xl">#{metadata.id}</span>
      <Metadata data={metadata.data} id={metadata.id} extra={metadata.extra} />
    </div>
  ) : (
    <Loader />
  )
}
