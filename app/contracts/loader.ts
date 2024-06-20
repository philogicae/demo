import { Abi } from 'viem'
import registry from './registry.json'
import TRY26 from './abis/TRY26.json'

const reg: {
  [contract: string]: {
    [chainId: string]: string
  }
} = registry

const abis: {
  [contract: string]: Abi
} = {
  TRY26: TRY26.abi as Abi,
}

export type ContractData = {
  address: `0x${string}`
  abi: Abi
}

const load = (
  contract: string,
  chainId: number = 0
): ContractData | undefined => {
  const chain = chainId.toString()
  if (reg?.[contract][chain] && abis[contract])
    return {
      address: reg[contract][chain] as `0x${string}`,
      abi: abis[contract],
    }
}

export default load
