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
  batchId: bigint,
  batchSecret: Hex,
  ticketSecret: Hex,
  signature: Hex
): Promise<string> => {
  const object = `${chainId.toString()}:${Number(batchId)}.${batchSecret.slice(
    2
  )}${ticketSecret.slice(2)}${signature.slice(2)}`
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
    ticketSecrets.map(async (ticketSecret) =>
      (
        await generateTicketHash(
          chainId,
          batchId,
          batchSecret,
          ticketSecret,
          signature
        )
      ).replace('~', '')
    )
  )

export const extractFromTicketHash = async (
  ticketCode: string,
  address?: Address
): Promise<
  | {
      chainId: number
      content: {
        batchId: bigint
        batchSecret: Hex
        ticketSecret: Hex
        signature: Omit<Signature, 'yParity'>
      }
      reservation: Hex
      ticketId: Hex
    }
  | undefined
> => {
  try {
    const decoded = await decode(ticketCode)
    const unwrapped = decoded.split(':')
    const chainId = Number(unwrapped[0])
    const data = unwrapped[1].split('.')
    const batchId = BigInt(data[0])
    const batchSecret = `0x${data[1].slice(0, 64)}` as Hex
    const ticketSecret = `0x${data[1].slice(64, 128)}` as Hex
    const signature = parseSignature(`0x${data[1].slice(128)}` as Hex)
    const reservation = keccak256(
      encodePacked(
        ['address', 'bytes32', 'bytes32'],
        [
          address || '0x0000000000000000000000000000000000000001',
          batchSecret,
          ticketSecret,
        ]
      )
    ) as Hex
    const ticketId = keccak256(
      encodePacked(['bytes32', 'bytes32'], [batchSecret, ticketSecret])
    ) as Hex
    return {
      chainId,
      content: {
        batchId,
        batchSecret,
        ticketSecret,
        signature: {
          v: signature.v,
          r: signature.r,
          s: signature.s,
        },
      },
      reservation,
      ticketId,
    }
  } catch (e) {
    console.error(e)
  }
}
