// @ts-expect-error expected
import { decode, encode } from 'base64-compressor'
import { nanoid } from 'nanoid'
import {
  Hex,
  Signature,
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
  batchId: bigint,
  batchSecret: Hex,
  ticketSecret: Hex,
  signature: Hex
): Promise<string> => {
  const object =
    chainId.toString() +
    ':' +
    Number(batchId) +
    '.' +
    batchSecret.slice(2) +
    ticketSecret.slice(2) +
    signature.slice(2)
  return await encode(object)
}

export const generateBatchTicketHash = async (
  chainId: number,
  batchId: bigint,
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
        batchId: bigint
        batchSecret: Hex
        ticketSecret: Hex
        signature: Signature
      }
    }
  | undefined
> => {
  try {
    const decoded = await decode(ticketCode)
    const unwrapped = decoded.split(':')
    const chainId = Number(unwrapped[0])
    const data = unwrapped[1].split('.')
    const batchId = BigInt(data[0])
    const batchSecret = ('0x' + data[1].slice(0, 64)) as Hex
    const ticketSecret = ('0x' + data[1].slice(64, 128)) as Hex
    const signature = parseSignature(('0x' + data[1].slice(128)) as Hex)
    return {
      chainId,
      content: {
        batchId,
        batchSecret,
        ticketSecret,
        signature,
      },
    }
  } catch (e) {
    console.error(e)
  }
}
