import type { Abi, Address } from 'viem'
import TRY26 from './abis/TRY26.json'
import registry from './registry.json'

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
  address: Address
  abi: Abi
}

const load = (contract: string, chainId = 0): ContractData | undefined => {
  const chain = chainId.toString()
  if (reg?.[contract][chain] && abis[contract])
    return {
      address: reg[contract][chain] as Address,
      abi: abis[contract],
    }
}

export default load
