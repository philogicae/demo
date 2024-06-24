'use client'
import { LinkButton } from '@components/elements/Buttons'
import { Metrics } from '@components/elements/Metrics'

export default function Welcome() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-2 pb-14">
      <Metrics />
      <div className="flex flex-col w-[270px] items-center justify-center gap-5 py-6 rounded-lg bg-white bg-opacity-10">
        <LinkButton page="/create" label="Create New Batch" />
        <LinkButton page="/claim/TODO" label="Example Claim Page" />
        <LinkButton page="/token/1" label="Example Token Page" />
      </div>
      <div className="flex items-center w-[270px] justify-center p-2 rounded-lg bg-white bg-opacity-10">
        <span className="text-sm">This is a demo.</span>
      </div>
    </div>
  )
}
