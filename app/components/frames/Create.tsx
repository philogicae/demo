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
        className="max-w-xs"
      >
        {Object.keys(metadatas).map((metadata, index) => (
          <SelectItem key={metadata}>{metadata}</SelectItem>
        ))}
      </Select>
      <span className="pt-3 w-80 h-80">
        {JSON.stringify(
          (metadatas as Record<string, any>)[metadataId],
          null,
          2
        )}
      </span>
    </div>
  )
}
