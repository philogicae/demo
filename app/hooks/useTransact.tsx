'use client'
import { txType } from '@context/Wallet'
import type { ContractData } from '@contracts/loader'
import { useEffect, useMemo } from 'react'
import { parseEventLogs } from 'viem'
import {
  useChains,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

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
  ignoreError = false,
  onSuccess,
  onError,
}: TransactProps) {
  const chains = useChains()
  const blockExplorer = chains.find((chain) => chain.id === chainId)
    ?.blockExplorers?.default.url

  const { data, isSuccess: isPrepareSuccess } = useSimulateContract({
    chainId,
    ...contract,
    functionName: method,
    args,
    type: txType[chainId],
    query: { enabled },
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

  const txLink = useMemo(() => {
    return txHash ? blockExplorer + '/tx/' + txHash : undefined
  }, [blockExplorer, txHash])

  useEffect(() => {
    if (isPostSuccess) {
      console.log('Tx confirmed:', txLink)
      onSuccess?.()
    } else if (isPostError && !ignoreError) {
      console.error('Tx failed:', postError)
      onError?.()
    }
  }, [isPostSuccess, isPostError])

  return {
    sendTx: () =>
      isPrepareSuccess &&
      writeContractAsync(data!.request).catch(() => {
        if (!isPreSuccess && !ignoreError) {
          console.warn('Tx rejected:', preError)
          onError?.()
        }
      }),
    txReceipt,
    txLogs:
      txReceipt &&
      parseEventLogs({ abi: contract?.abi!, logs: txReceipt.logs }),
    txLink,
    isReadyTx: isPrepareSuccess,
    isLoadingTx: isPreLoading,
    isPendingTx: isPostLoading,
    isSuccessTx: isPreSuccess && isPostSuccess,
    isErrorTx: isPreError || isPostError,
    errorTx: preError || postError,
  }
}
