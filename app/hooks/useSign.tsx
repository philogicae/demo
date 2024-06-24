'use client'
import { useRef } from 'react'
import { type Hex, parseSignature, verifyTypedData } from 'viem'
import { useSignTypedData } from 'wagmi'

export function useSign({
  onSuccess,
  onError,
}: { onSuccess?: () => void; onError?: () => void } = {}) {
  const isValidSignature = useRef<boolean>(true)
  const {
    signTypedDataAsync,
    data: signature,
    isPending,
    isSuccess,
    isError,
  } = useSignTypedData()

  const signRequest = ({ args }: { args: any }) => {
    signTypedDataAsync({ ...args })
      .then(() => {
        console.log('Signed successfully')
        onSuccess?.()
      })
      .catch(() => {
        console.warn('Signature rejected')
        onError?.()
      })
  }

  const toSignature = ({ args, hex }: { args: any; hex: Hex }) => {
    verifyTypedData({
      ...args,
      address: args.account,
      signature: hex,
    })
      .then((isValid) => {
        isValidSignature.current = isValid
      })
      .catch((error) => {
        console.error('Error during signature verification:', error)
      })
    return parseSignature(hex)
  }

  return {
    signRequest,
    signature,
    isPendingSign: isPending,
    isSuccessSign: isSuccess && isValidSignature.current,
    isErrorSign: isError || !isValidSignature.current,
    convert: toSignature,
  }
}
