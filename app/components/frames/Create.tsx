'use client'
import metadatas from '@contracts/metadatas.json'
import { useState } from 'react'
import { Select, SelectItem } from '@nextui-org/select'

export default function Create() {
  const [metadataId, setMetadataId] = useState<string>('')
  const handleMetadataId = (e: any) => {
    setMetadataId(e.target.value)
    console.log(e.target.value)
  }
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <Select
        isRequired
        size="sm"
        color="primary"
        variant="faded"
        label="Metadata"
        placeholder="Select a template"
        selectedKeys={[metadataId]}
        onChange={handleMetadataId}
        classNames={{
          popoverContent: 'bg-white text-black',
        }}
        className="max-w-xs"
      >
        {Object.keys(metadatas).map((metadata) => (
          <SelectItem
            key={metadata}
            classNames={{
              base: 'data-[hover=true]:bg-amber-300',
            }}
          >
            {metadata}
          </SelectItem>
        ))}
      </Select>
      <span className="pt-5 w-80 h-80">
        {JSON.stringify(
          (metadatas as Record<string, any>)[metadataId],
          null,
          2
        )}
      </span>
    </div>
  )
}
