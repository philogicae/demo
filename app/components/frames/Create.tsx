'use client'
import { useState } from 'react'
import { restrictRange } from '@utils/convert'
import metadatas from '@contracts/metadatas.json'
import { Metadata } from '@components/elements/Metadata'
import { Input, Select, SelectItem } from '@nextui-org/react'
import { ActionButton } from '@components/elements/Buttons'
import { FaArrowRightLong } from 'react-icons/fa6'
import { Loader } from '@components/elements/Loader'
import { sepolia } from 'wagmi/chains'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import load from '@contracts/loader'
import {
  generateHex,
  generateBatchHex,
  generateTicketIds,
} from '@utils/packing'
//import { useTransact } from '@hooks/useTransact'

const defaultChain = sepolia

export default function Create() {
  const { isConnected } = useAccount()
  const { switchChain } = useSwitchChain()
  const chainId = useChainId()
  const contract = load('TRY26', chainId)
  if (isConnected && !contract) switchChain({ chainId: defaultChain.id })
  const [metadataId, setMetadataId] = useState('')
  const [units, setUnits] = useState('')

  const [loading, setLoading] = useState(false)

  const handleCreateBatch = async () => {
    const batchSecret = generateHex()
    const ticketSecrets = generateBatchHex(Number(units))
    const ticketIds = generateTicketIds(batchSecret, ticketSecrets)
    console.log({ ticketIds })
    setLoading(true)
  }

  const handleSignTickets = async () => {}

  /* const { sendTx, isReadyTx, isLoadingTx, isSuccessTx, isErrorTx } =
    useTransact({
      chainId: chainId!,
      contract,
      method: 'createOrder',
      args: steps.tx3,
      enabled: steps.txArgs3,
    }) */

  return (
    <div className="flex flex-col items-center justify-start w-full mt-10 mb-4 px-4 gap-2">
      <span className="text-center text-xl rounded-lg text-gray-950 bg-white bg-opacity-30 px-2 pb-0.5 font-bold">
        Create a new batch of TRY26&rsquo;s
      </span>
      <Select
        isRequired
        size="sm"
        color="primary"
        variant="faded"
        label="Metadata"
        placeholder="Select a template"
        selectorIcon={<></>}
        selectedKeys={[metadataId]}
        onChange={(e: any) => {
          setMetadataId(e.target.value)
        }}
        classNames={{
          innerWrapper: 'w-full',
          trigger:
            'bg-opacity-10 border-1 hover:!border-white group-data-[focus=true]:!border-white group-data-[focus-visible=true]:!border-white',
          label: 'text-white font-bold text-md',
          value: 'text-right font-bold !text-white text-sm',
          popoverContent: 'text-white bg-gray-800',
        }}
        className="max-w-xs"
      >
        {Object.entries(metadatas).map(([id, data]) => (
          <SelectItem key={id}>{`${id}. ${data.name}`}</SelectItem>
        ))}
      </Select>
      <Input
        isRequired
        size="sm"
        color="primary"
        variant="faded"
        label="Unit(s)"
        placeholder="0"
        type="number"
        value={units}
        onChange={(e: any) => {
          setUnits(
            restrictRange(Math.round(Number(e.target.value)), 1, 50).toString()
          )
        }}
        min={1}
        max={50}
        classNames={{
          inputWrapper:
            'bg-opacity-10 border-1 hover:!border-white group-data-[focus=true]:!border-white group-data-[focus-visible=true]:!border-white',
          label: 'text-white text-md font-bold',
          input:
            'text-right text-white font-bold no-arrow placeholder:text-white',
        }}
        className="max-w-xs"
      />
      <div className="flex flex-row py-1 items-center justify-between w-full max-w-xs">
        <ActionButton
          label="Create Batch"
          isActive={metadataId && units}
          isLoading={loading}
          onClick={handleCreateBatch}
        />
        {false ? (
          <Loader size={30} color="white" />
        ) : metadataId && units ? (
          <span className="px-1 font-bold text-sm text-lime-300">ready</span>
        ) : (
          <FaArrowRightLong />
        )}
        <ActionButton
          label="Sign Tickets"
          isActive={false}
          isLoading={false}
          onClick={handleSignTickets}
        />
      </div>
      {metadataId.length > 0 ? (
        <Metadata
          data={(metadatas as Record<string, any>)[metadataId]}
        ></Metadata>
      ) : null}
    </div>
  )
}
