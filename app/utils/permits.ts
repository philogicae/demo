import type { Address, Hex } from 'viem'

const generatePreMintPermit = ({
  chainId,
  contactAddr,
  creator,
  batchId,
  batchSecret,
}: {
  chainId: number
  contactAddr: Address
  creator: Address
  batchId: bigint
  batchSecret: Hex
}): any => {
  return {
    account: creator,
    domain: {
      name: 'TwentySix Soulbound',
      version: '1',
      chainId,
      verifyingContract: contactAddr,
    } as const,
    primaryType: 'PreMintPermit',
    types: {
      PreMintPermit: [
        { name: 'creator', type: 'address' },
        { name: 'batchId', type: 'uint256' },
        { name: 'batchSecret', type: 'bytes32' },
      ],
    } as const,
    message: {
      creator,
      batchId,
      batchSecret,
    } as const,
  }
}

export { generatePreMintPermit }
