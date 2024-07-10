'use client'
import { ActionButton } from '@components/elements/Buttons'
import { Loader } from '@components/elements/Loader'
import { Metadata } from '@components/elements/Metadata'
import { Tickets } from '@components/elements/Tickets'
import { defaultChain } from '@context/Wallet'
import load from '@contracts/loader'
import metadatas from '@contracts/metadatas.json'
import { useCall } from '@hooks/useCall'
import { useSign } from '@hooks/useSign'
import { useTransact } from '@hooks/useTransact'
import { Input, Select, SelectItem } from '@nextui-org/react'
import { restrictRange } from '@utils/convert'
import { addTicketRows } from '@utils/nocodb'
import {
  generateBatchHex,
  generateBatchTicketHash,
  generateHex,
  generateTicketIds,
} from '@utils/packing'
import { generatePreMintPermit } from '@utils/permits'
import { downloadQrCodesZip, generateQrCode } from '@utils/qrcodes'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useEffect, useState } from 'react'
import {
  FaArrowLeftLong,
  FaArrowRightLong,
  FaArrowUpLong,
  FaLink,
  FaRegCircleCheck,
  FaWallet,
} from 'react-icons/fa6'
import type { Address, Hex } from 'viem'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'

const maxTickets = 100
const defaultHashes = {
  batchSecret: '' as Hex,
  ticketSecrets: [] as Hex[],
  ticketIds: [] as Hex[],
}

export default function Create() {
  const { open } = useWeb3Modal()
  const { isConnected, address } = useAccount()
  const { switchChain } = useSwitchChain()
  const chainId = useChainId()
  const contract = load('TRY26', chainId)
  if (isConnected && !contract) switchChain({ chainId: defaultChain.id })

  const [metadataId, setMetadataId] = useState('')
  const [units, setUnits] = useState('')
  const [hashes, setHashes] = useState(defaultHashes)
  const [batchId, setBatchId] = useState(BigInt(0))
  const [tickets, setTickets] = useState<
    { id: string; data: string; url: string; qrCode: string }[]
  >([])

  const { fetch, result } = useCall({
    calls: [
      {
        chainId,
        contract: contract!,
        functionName: 'owner',
      },
    ],
    initData: ['0x1' as Address],
  })

  useEffect(() => {
    !!contract && fetch()
  }, [contract])

  const handleCreateBatch = () => {
    if (!isConnected) open()
    else {
      const batchSecret = generateHex()
      const ticketSecrets = generateBatchHex(Number(units))
      const ticketIds = generateTicketIds(batchSecret, ticketSecrets)
      setHashes({ batchSecret, ticketSecrets, ticketIds })
    }
  }

  const {
    sendTx,
    txLogs,
    txLink,
    isReadyTx,
    isLoadingTx,
    isPendingTx,
    isSuccessTx,
  } = useTransact({
    chainId,
    contract,
    method: 'preMint',
    args: [metadataId, hashes.ticketIds],
    enabled: !!hashes.batchSecret,
    onSuccess: () => setBatchId((txLogs?.[0].args as any)?.batchId as bigint),
    onError: () => setHashes(defaultHashes),
  })

  useEffect(() => {
    if (isReadyTx) sendTx()
  }, [isReadyTx])

  const { signRequest, signature, isPendingSign, isSuccessSign } = useSign()

  const handleSignTickets = () => {
    if (!isConnected) open()
    else {
      signRequest({
        args: generatePreMintPermit({
          chainId,
          contactAddr: contract!.address,
          creator: address!,
          batchId: batchId,
          batchSecret: hashes.batchSecret,
        }),
      })
    }
  }

  useEffect(() => {
    if (isSuccessSign) {
      generateBatchTicketHash(
        chainId,
        batchId,
        hashes.batchSecret,
        hashes.ticketSecrets,
        signature as Hex
      ).then((tickets) => {
        const printed = [] as {
          id: string
          data: string
          url: string
          qrCode: string
        }[]
        const rows = [] as any[]
        tickets.forEach((ticket, index) => {
          const url = `${window.location.origin}/#/ticket/${ticket}`
          printed.push({
            id: `#${index + 1 < 10 ? '0' : ''}${index + 1}`,
            data: ticket,
            url: url,
            qrCode: generateQrCode(url)!,
          })
          rows.push({
            'Ticket Id': hashes.ticketIds[index],
            'Batch Id': Number(batchId),
            'Metadata Id': Number(metadataId),
            URL: url,
          })
        })
        addTicketRows(rows, chainId === 11155111)
        setTickets(printed)
      })
    }
  }, [isSuccessSign])

  return (
    <div className="flex flex-col items-center justify-start w-full mt-10 mb-4 px-4 gap-2">
      <span className="text-center text-xl rounded-lg text-black italic px-2 pb-0.5 font-extrabold">
        Create a new batch of tickets
      </span>
      <Select
        isRequired
        isDisabled={isLoadingTx || isPendingTx || isSuccessTx}
        size="sm"
        color="primary"
        variant="faded"
        label="Metadata"
        placeholder="Select a template"
        // biome-ignore lint/complexity/noUselessFragments: <explanation>
        selectorIcon={<></>}
        selectedKeys={[metadataId]}
        onChange={(e: any) =>
          !isLoadingTx &&
          !isPendingTx &&
          !isSuccessTx &&
          setMetadataId(e.target.value)
        }
        classNames={{
          base: isSuccessTx ? 'opacity-80' : '',
          innerWrapper: 'w-full',
          trigger:
            'bg-opacity-10 border-1 hover:!border-white group-data-[focus=true]:!border-white group-data-[focus-visible=true]:!border-white',
          label: 'text-black font-bold text-md',
          value: 'text-right font-bold !text-purple text-sm',
          popoverContent: 'text-white bg-gray-950',
        }}
        className="max-w-xs"
      >
        {Object.entries(metadatas).map(([id, data]) => (
          <SelectItem key={id}>{`${id}. ${data.name}`}</SelectItem>
        ))}
      </Select>
      <Input
        isRequired
        isDisabled={
          address !== result?.owner || isLoadingTx || isPendingTx || isSuccessTx
        }
        size="sm"
        color="primary"
        variant="faded"
        label="Unit(s)"
        placeholder="0"
        type="number"
        value={units}
        onChange={(e: any) =>
          !isLoadingTx &&
          !isPendingTx &&
          !isSuccessTx &&
          setUnits(
            restrictRange(
              Math.round(Number(e.target.value)),
              1,
              maxTickets
            ).toString()
          )
        }
        min={1}
        max={maxTickets}
        classNames={{
          base: isSuccessTx ? 'opacity-80' : '',
          inputWrapper:
            'bg-opacity-10 border-1 hover:!border-white group-data-[focus=true]:!border-white group-data-[focus-visible=true]:!border-white',
          label: 'text-black text-md font-bold',
          input:
            'text-right text-black font-bold no-arrow placeholder:text-purple',
        }}
        className="max-w-xs"
      />
      <div className="flex flex-row py-1 items-center justify-between w-full max-w-xs">
        <ActionButton
          label={
            address !== result?.owner ? (
              'Restricted'
            ) : !isSuccessTx ? (
              'Create Batch'
            ) : (
              <a
                className="flex flex-row hover:underline"
                href={txLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaLink className="mr-1 w-4 h-4" />
                <span className="text-xs">Confirmed</span>
              </a>
            )
          }
          isActive={
            address === result?.owner &&
            !!metadataId &&
            !!units &&
            !isLoadingTx &&
            !isPendingTx &&
            !isSuccessTx
          }
          isIdle={isSuccessTx}
          isLoading={isLoadingTx}
          onClick={!isSuccessTx ? handleCreateBatch : () => {}}
          className={address !== result?.owner ? 'disabled:!bg-red-200' : ''}
        />
        {isLoadingTx || isPendingSign ? (
          <FaWallet className="w-5 h-5" />
        ) : isPendingTx ? (
          <Loader />
        ) : isSuccessSign ? (
          <div className="px-1 text-purple">
            <FaRegCircleCheck className="w-5 h-5" />
          </div>
        ) : isSuccessTx ? (
          <FaArrowRightLong />
        ) : metadataId && units ? (
          <FaArrowLeftLong />
        ) : (
          <FaArrowUpLong />
        )}
        <ActionButton
          label={
            address !== result?.owner ? (
              'Restricted'
            ) : !tickets.length ? (
              'Sign Tickets'
            ) : (
              <span className="text-xs">Export All</span>
            )
          }
          isActive={address === result?.owner && isSuccessTx}
          isIdle={!!tickets.length}
          isLoading={isPendingSign}
          onClick={() => {
            if (!tickets.length) handleSignTickets()
            else {
              const zipName = `batch_B${Number(batchId)}`
              downloadQrCodesZip(zipName, tickets)
                .then(() => console.log(`${zipName}.zip created.`))
                .catch(console.error)
            }
          }}
          className={address !== result?.owner ? 'disabled:!bg-red-200' : ''}
        />
      </div>
      {tickets.length > 0 ? (
        <Tickets batchId={Number(batchId)} tickets={tickets} />
      ) : metadataId.length > 0 ? (
        <Metadata data={(metadatas as Record<string, any>)[metadataId]} />
      ) : null}
    </div>
  )
}
