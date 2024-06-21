import { useEffect } from 'react'

export default function Loader() {
  useEffect(() => {
    async function getLoader() {
      const { bouncy } = await import('ldrs')
      bouncy.register()
    }
    getLoader()
  }, [])
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <l-bouncy size="70" speed="1.5" color="white" />
    </div>
  )
}
