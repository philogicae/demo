import type { ContractData } from '@contracts/loader'
import {
  type CallWithERC2771Request,
  ERC2771Type,
  GelatoRelay,
  TaskState,
  type TransactionStatusResponse,
} from '@gelatonetwork/relay-sdk-viem'
import type { PayloadToSign } from '@gelatonetwork/relay-sdk-viem/dist/lib/erc2771/types'
import { useSign } from '@hooks/useSign'
import { useEffect, useMemo, useState } from 'react'
import {
  http,
  type Abi,
  type Hex,
  type ParseEventLogsReturnType,
  createWalletClient,
  encodeFunctionData,
  parseEventLogs,
} from 'viem'
import { useAccount, useChains, useWaitForTransactionReceipt } from 'wagmi'

if (!process.env.NEXT_PUBLIC_GELATO_RELAY_API_KEY)
  throw new Error('NEXT_PUBLIC_GELATO_RELAY_API_KEY is not defined')
const gelatoApiKey = process.env.NEXT_PUBLIC_GELATO_RELAY_API_KEY

export type GaslessProps = {
  chainId: number
  contract?: ContractData
  method: string
  args: any[]
  onSuccess?: (logs: ParseEventLogsReturnType<Abi, undefined, true>) => void
  onError?: () => void
}

export function useGasless({
  chainId,
  contract,
  method,
  args = [],
  onSuccess,
  onError,
}: GaslessProps) {
  const chains = useChains()
  const blockExplorer = chains.find((chain) => chain.id === chainId)
    ?.blockExplorers?.default.url
  const { address } = useAccount()
  const client = createWalletClient({
    account: address,
    transport: http('https://eth-sepolia.public.blastapi.io'),
    //http('https://ava-mainnet.public.blastapi.io/ext/bc/C/rpc'),
  })
  const relay = useMemo(() => {
    return new GelatoRelay()
  }, [chainId, contract, method])
  const [state, setState] = useState({
    data: undefined as any,
    isPending: false,
    isSuccess: false,
    isError: false,
    error: undefined as any,
  })
  const [payload, setPayload] = useState(undefined as PayloadToSign | undefined)
  const [txHash, setTxHash] = useState(undefined as Hex | undefined)

  const { signRequest, signature, isPendingSign } = useSign({
    onError: () => {
      setState({
        ...state,
        error: 'Error during signature for relay',
        isPending: false,
        isError: true,
      })
    },
  })

  const {
    data: txReceipt,
    isSuccess: isPostSuccess,
    isError: isPostError,
    error: postError,
  } = useWaitForTransactionReceipt({
    chainId,
    hash: txHash,
    confirmations: 1,
    query: { enabled: !!txHash },
  })

  relay.onTaskStatusUpdate((taskStatus: TransactionStatusResponse) => {
    if (state.isSuccess) return
    if (
      taskStatus.taskState === TaskState.Cancelled ||
      taskStatus.taskState === TaskState.ExecReverted
    ) {
      setState({
        ...state,
        isPending: false,
        isError: true,
      })
      console.error('Tx failed.')
    } else if (taskStatus.taskState === TaskState.ExecSuccess) {
      setTxHash(taskStatus.transactionHash as Hex)
    }
  })

  const sendToRelay = () => {
    if (isPendingSign || state.isPending || state.isSuccess) return

    const relayRequest = {
      user: address,
      chainId: BigInt(chainId),
      target: contract!.address,
      data: encodeFunctionData({
        abi: contract!.abi,
        functionName: method,
        args,
      }),
    } as CallWithERC2771Request

    relay
      .getDataToSignERC2771(
        relayRequest,
        ERC2771Type.SponsoredCall,
        client as any
      )
      .then((payload) => {
        setPayload(payload)
        signRequest({ args: payload.typedData })
      })
  }

  useEffect(() => {
    if (!payload || !signature) return
    setState({
      ...state,
      isPending: true,
    })
    relay
      .sponsoredCallERC2771WithSignature(
        payload.struct,
        signature,
        gelatoApiKey
      )
      .then((response) => {
        console.log(
          `Relay task: https://relay.gelato.digital/tasks/status/${response.taskId}`
        )
      })
      .catch((err) => {
        setState({
          ...state,
          error: err,
          isPending: false,
          isError: true,
        })
        console.error('Error during relay call:', err)
        onError?.()
      })
  }, [payload, signature])

  const txLogs = useMemo(() => {
    if (!txReceipt) return
    setState({
      ...state,
      isPending: false,
      isSuccess: true,
    })
    const logs = parseEventLogs({ abi: contract?.abi!, logs: txReceipt.logs })
    onSuccess?.(logs)
    return logs
  }, [txReceipt])

  const txLink = useMemo(() => {
    if (!txHash) return
    const txLink = txHash ? `${blockExplorer}/tx/${txHash}` : undefined
    console.log('Tx confirmed:', txLink)
    return txLink
  }, [txHash])

  return {
    sendToRelay,
    txReceipt,
    txLogs,
    txLink,
    isLoadingTx: isPendingSign,
    isPendingTx: state.isPending,
    isSuccessTx: state.isSuccess && isPostSuccess,
    isErrorTx: state.isError || isPostError,
    errorTx: state.error || postError,
  }
}
