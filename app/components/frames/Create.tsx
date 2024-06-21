'use client'
import metadatas from '@contracts/metadatas.json'
import { useState } from 'react'
import { Input, Select, SelectItem } from '@nextui-org/react'
import { Metadata } from '@components/elements/Metadata'

export default function Create() {
  const [units, setUnits] = useState('')
  const [metadataId, setMetadataId] = useState('')
  const restrict = (n: any, min: number, max: number) =>
    Number(n) > max ? max : Number(n) < min ? min : n
  return (
    <div className="flex flex-col items-center justify-start w-full py-10 px-5 gap-3">
      <span className="text-center text-xl rounded-lg bg-green-800 bg-opacity-20 px-2 pb-1 font-bold">
        Create a new batch of TRY26&rsquo;s
      </span>
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
            restrict(Math.round(Number(e.target.value)), 1, 50).toString()
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
      {metadataId.length > 0 ? (
        <Metadata
          data={(metadatas as Record<string, any>)[metadataId]}
        ></Metadata>
      ) : null}
    </div>
  )
}
