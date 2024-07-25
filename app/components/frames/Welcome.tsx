'use client'
import { LinkButton } from '@components/elements/Buttons'
import { Metrics } from '@components/elements/Metrics'

export default function Welcome() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-1.5 pb-14">
      <div className="flex flex-col w-[270px] items-center justify-center gap-3 py-5 px-4 rounded-lg bg-violet-400 bg-opacity-10">
        {/* <LinkButton page="/create" label="Create New Batch" />
        <LinkButton page="/ticket" label="Example /ticket/..." />
        <LinkButton page="/token/1" label="Example /token/..." /> */}
        <span className="text-center text-xl font-extrabold w-44 pb-1 text-black">
          Welcome on TwentySix Claim
        </span>
        <p className="text-center text-xs font-semibold">
          Wait, how did you find your way here? Hmm, you're probably one of the
          lucky few who got its hands on a very unusual ticket...
        </p>
        <p className="text-center text-xs font-semibold">
          Use it to claim an exclusive NFT, giving you access to a special
          allocation to try out{' '}
          <a
            href="https://www.twentysix.cloud/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold hover:underline"
          >
            Twentysix Cloud
          </a>
          , completely free of charge for a limited period of time. The claim
          process is fast, secure & gasless, all you need is a wallet.
        </p>
        <p className="text-center text-xs font-semibold">
          You're one scan away from diving into the DePIN multiverse. The dream
          of a safe & decentralized Internet isn't dead, actually...{' '}
          <b>it's just the beginning!</b>
        </p>
      </div>
      <Metrics />
    </div>
  )
}
