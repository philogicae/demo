'use client'
import { LinkButton } from '@components/elements/Buttons'
import { Metrics } from '@components/elements/Metrics'

export default function Welcome() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-2 pb-14">
      <Metrics />
      <div className="flex flex-col w-[270px] items-center justify-center gap-5 py-6 rounded-lg bg-white bg-opacity-10">
        <LinkButton page="/create" label="Create New Batch" />
        <LinkButton page="/claim" label="Example /claim/..." />
        <LinkButton page="/token/1" label="Example /token/..." />
      </div>
      <div className="flex items-center w-[270px] justify-center p-2 rounded-lg bg-white bg-opacity-10">
        <p className="text-sm text-center">
          {
            'Demo featuring a minimalist UI. "Create new Batch" page is exclusively for team, and only contract owner will be able to use it. Ideally, we need to serve 2 pages via 26: /claim/{ticket-data} & /token/{id}. For system details, refer to forum post.'
          }
        </p>
      </div>
    </div>
  )
}
