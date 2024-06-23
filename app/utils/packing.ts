// @ts-expect-error expected
import { decode, encode } from 'base64-compressor'
import { nanoid } from 'nanoid'
import {
  type Address,
  type Hex,
  type Signature,
  encodePacked,
  keccak256,
  parseSignature,
  toHex,
} from 'viem'

export const generateHex = (): Hex => keccak256(toHex(nanoid(32)))

export const generateBatchHex = (units: number): Hex[] =>
  Array.from({ length: units }, generateHex)

export const generateTicketIds = (
  batchSecret: Hex,
  ticketSecrets: Hex[]
): Hex[] =>
  ticketSecrets.map((ticketSecret) =>
    keccak256(encodePacked(['bytes32', 'bytes32'], [batchSecret, ticketSecret]))
  )

export const generateTicketHash = async (
  chainId: number,
  batchId: Hex,
  batchSecret: Hex,
  ticketSecret: Hex,
  signature: Hex
): Promise<string> => {
  const object =
    chainId.toString() +
    ':' +
    batchId.slice(2) +
    batchSecret.slice(2) +
    ticketSecret.slice(2) +
    signature.slice(2)
  return await encode(object)
}

export const generateBatchTicketHash = async (
  chainId: number,
  batchId: Hex,
  batchSecret: Hex,
  ticketSecrets: Hex[],
  signature: Hex
): Promise<string[]> =>
  await Promise.all(
    ticketSecrets.map(
      async (ticketSecret) =>
        await generateTicketHash(
          chainId,
          batchId,
          batchSecret,
          ticketSecret,
          signature
        )
    )
  )

export const extractFromTicketHash = async (
  ticketCode: string
): Promise<
  | {
      chainId: number
      content: {
        batchId: Hex
        batchSecret: Hex
        ticketSecret: Hex
        signature: Signature
      }
    }
  | undefined
> => {
  try {
    const decoded = await decode(ticketCode)
    const chainId = Number(decoded.split(':')[0])
    const data = decoded.split(':')[1]
    const batchId = ('0x' + data.slice(0, 64)) as Address
    const batchSecret = ('0x' + data.slice(64, 128)) as Address
    const ticketSecret = ('0x' + data.slice(128, 192)) as Address
    const signature = parseSignature(('0x' + data.slice(192)) as Address)
    return {
      chainId,
      content: {
        batchId,
        batchSecret,
        ticketSecret,
        signature,
      },
    }
  } catch {
    return
  }
}
