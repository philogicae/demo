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
      <span className="text-xl text-black font-bold pb-3">
        Pre-Mint a new batch of SBTs
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
          label: 'text-black text-md',
          input: 'text-right text-black no-arrow placeholder:text-black',
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
          label: 'text-black text-md',
          value: 'text-right text-black',
          popoverContent: 'text-black',
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
