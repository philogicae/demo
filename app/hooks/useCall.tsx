'use client'
import type { ContractData } from '@contracts/loader'
import { useReadContracts } from 'wagmi'

type Call = {
  chainId?: number
  contract: ContractData
  functionName: string
  args?: readonly unknown[]
}

type CallsProps = {
  calls: Call[]
  initData: any[]
  enabled?: boolean
}

export function useCall({ calls, initData, enabled = false }: CallsProps) {
  const methods: { [method: string]: number } = {}
  for (const call of calls) {
    methods[call.functionName] = (methods[call.functionName] || 0) + 1
  }

  const reads = useReadContracts({
    contracts: calls.map((x) => ({
      chainId: x.chainId,
      ...x.contract,
      functionName: x.functionName,
      args: x.args,
    })),
    query: {
      enabled,
      select: (data) => {
        const result: { [method: string]: any } = {}
        ;(data?.length
          ? data.map((x, i) => {
              const field = initData[i]
              return x.status === 'success'
                ? (x.result as typeof field)
                : initData[i]
            })
          : initData
        ).forEach((x: any, i: number) => {
          result[calls[i].functionName] =
            methods[calls[i].functionName] > 1
              ? [...(result[calls[i].functionName] || []), x]
              : x
        })
        return result
      },
    },
  })

  return {
    result: reads.data!,
    fetch: reads.refetch,
    isLoading: reads.isLoading,
    isSuccess: reads.isSuccess,
    isError: reads.isError,
  }
}
