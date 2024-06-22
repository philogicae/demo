'use client'
import { useEffect, useRef } from 'react'
import { ContractData } from '@contracts/loader'
import {
  useChains,
  useSimulateContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { txType } from '@context/Wallet'

export type TransactProps = {
  chainId: number
  contract?: ContractData
  method: string
  args: any[]
  enabled: boolean
  ignoreError?: boolean
  onSuccess?: () => void
  onError?: () => void
}

export function useTransact({
  chainId,
  contract,
  method,
  args = [],
  enabled = false,
  ignoreError = true,
  onSuccess,
  onError,
}: TransactProps) {
  const chains = useChains()
  const blockExplorer = chains.find((chain) => chain.id === chainId)
    ?.blockExplorers?.default.url
  const executed = useRef<boolean>(false)
  const {
    data,
    isSuccess: isPrepareSuccess,
    isError: isPrepareError,
  } = useSimulateContract({
    chainId,
    ...contract,
    functionName: method,
    args: args,
    type: txType[chainId],
    query: {
      enabled: enabled && !executed.current,
    },
  })
  const {
    writeContractAsync,
    data: txHash,
    isPending: isPreLoading,
    isSuccess: isPreSuccess,
    isError: isPreError,
    error: preError,
  } = useWriteContract()

  const {
    data: txReceipt,
    isLoading: isPostLoading,
    isSuccess: isPostSuccess,
    isError: isPostError,
    error: postError,
  } = useWaitForTransactionReceipt({
    chainId,
    hash: txHash,
    confirmations: 1,
    query: { enabled: !!txHash },
  })

  useEffect(() => {
    if (isPrepareError) {
      if (!ignoreError) console.error('Tx error')
      onError && onError()
    }
  }, [isPrepareError])

  useEffect(() => {
    if (isPostSuccess) {
      if (!executed.current) {
        executed.current = true
        console.log('Tx confirmed')
        onSuccess && onSuccess()
      }
    } else if (isPostError) {
      console.error('Tx failed')
      onError && onError()
    }
  }, [isPostSuccess, isPostError])

  return {
    sendTx: () => {
      if (isPrepareSuccess) {
        writeContractAsync(data!.request).catch(() => {
          if (!ignoreError) console.warn('Tx rejected')
          onError && onError()
        })
      }
    },
    receipt: txReceipt,
    isReadyTx: isPrepareSuccess,
    isLoadingTx: isPreLoading || isPostLoading,
    isSuccessTx: isPreSuccess && isPostSuccess,
    isErrorTx: isPreError || isPostError,
    errorTx: preError || postError,
    txLink: txHash ? blockExplorer + '/tx/' + txHash : undefined,
  }
}
