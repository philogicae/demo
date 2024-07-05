'use client'
import { LinkButton } from '@components/elements/Buttons'
import { Metrics } from '@components/elements/Metrics'

export default function Welcome() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-1.5 pb-14">
      <Metrics />
      <div className="flex flex-col w-[270px] items-center justify-center gap-5 py-6 rounded-lg bg-violet-400 bg-opacity-10">
        <LinkButton page="/create" label="Create New Batch" />
        <LinkButton page="/ticket" label="Example /ticket/..." />
        <LinkButton page="/token/1" label="Example /token/..." />
      </div>
    </div>
  )
}
