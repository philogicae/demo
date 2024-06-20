import { Address, Hex } from 'viem'

const generatePreMintPermit = ({
  chainId,
  contactAddr,
  admin,
  batchId,
  batchSecret,
}: {
  chainId: number
  contactAddr: Address
  admin: Address
  batchId: bigint
  batchSecret: Hex
}): any => {
  return {
    account: admin,
    domain: {
      name: 'TwentySix SBT',
      version: '1',
      chainId: chainId,
      verifyingContract: contactAddr,
    } as const,
    primaryType: 'PreMintPermit',
    types: {
      TicketPermit: [
        { name: 'admin', type: 'address' },
        { name: 'batchId', type: 'uint256' },
        { name: 'batchSecret', type: 'bytes32' },
      ],
    } as const,
    message: {
      creator: admin,
      orderId: batchId,
      orderSecret: batchSecret,
    } as const,
  }
}

export { generatePreMintPermit }
